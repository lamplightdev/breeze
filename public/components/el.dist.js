const WaferMixin = (superclass)=>{
    class Wafer extends superclass {
        static get template() {
            return "";
        }
        static get props() {
            return {
            };
        }
        static get observedAttributes() {
            return Object.entries(this.props).map(([name, info])=>{
                return info.attributeName || name;
            });
        }
        get props() {
            return this.constructor.props;
        }
        constructor(...args){
            super(...args);
            this._connectedOnce = false;
            this._propNames = Object.keys(this.props);
            this._attrToProp = {
            };
            for (const propName of this._propNames){
                this._attrToProp[this.props[propName].attributeName || propName] = propName;
            }
            this._props = {
            };
            this._changing = false;
            this._updatePromise = null;
            this._toUpdate = new Map();
            this._firstUpdate = true;
            this._newChanges = false;
            this._removeUnreflectedAttributes = true;
            this._initials = {
            };
        }
        _setter(name) {
            return (value)=>{
                this._toUpdate.set(name, value);
                this._newChanges = true;
                this.triggerUpdate();
            };
        }
        _getter(name) {
            return ()=>{
                return this._toUpdate.has(name) ? this._toUpdate.get(name) : this._props[name];
            };
        }
        initialiseProps() {
            for (const name of this._propNames){
                const { initial  } = this.props[name];
                this._initials[name] = this[name] !== void 0 ? this[name] : initial;
                Object.defineProperty(this, name, {
                    set: this._setter(name),
                    get: this._getter(name)
                });
            }
        }
        setupPropValues() {
            for (const name of this._propNames){
                if (this[name] === void 0) {
                    const { attributeName =name  } = this.props[name];
                    if (this.hasAttribute(attributeName)) {
                        this._setFromAttribute(name, this.getAttribute(attributeName));
                        if (this._removeUnreflectedAttributes && !this.props[name].reflect) {
                            this.removeAttribute(attributeName);
                        }
                    } else {
                        this[name] = this._initials[name];
                    }
                } else {
                    this._setFromProp(name, this[name]);
                }
            }
        }
        _setFromAttribute(name, value) {
            const { type  } = this.props[name];
            if (value === null) {
                this[name] = type === Boolean ? false : null;
                return;
            }
            switch(type){
                case Number:
                    this[name] = Number(value);
                    return;
                case Boolean:
                    this[name] = true;
                    return;
                case String:
                    this[name] = value;
                    break;
                default:
                    this[name] = JSON.parse(value);
                    return;
            }
        }
        _setFromProp(name, value) {
            if (!this._needsRehydrating) {
                const { type , reflect , attributeName =name  } = this.props[name];
                if (reflect || !this._removeUnreflectedAttributes) {
                    if (type === Boolean) {
                        if ([
                            null,
                            false,
                            void 0
                        ].includes(value)) {
                            if (this.hasAttribute(attributeName)) {
                                this.removeAttribute(attributeName);
                            }
                        } else {
                            this.setAttribute(attributeName, "");
                        }
                    } else {
                        if ([
                            null,
                            void 0
                        ].includes(value)) {
                            this.removeAttribute(attributeName);
                        } else {
                            const valueString = type !== Number && type !== String ? JSON.stringify(value) : value;
                            this.setAttribute(attributeName, valueString);
                        }
                    }
                }
            }
        }
        attributeChangedCallback(name, oldValue, newValue) {
            if (this._connectedOnce && !this._changing && oldValue !== newValue) {
                this._setFromAttribute(this._attrToProp[name], newValue);
            }
        }
        async triggerUpdate() {
            this._changing = true;
            this.update(null);
        }
        update(props = []) {
            this._updatePromise = this._updatePromise || Promise.resolve().then(async ()=>{
                const propNames = props ? props.length ? props : this._propNames : [];
                const allToUpdate = new Map();
                const initialValues = {
                    ...this._props
                };
                const noUpdate = {
                };
                if (propNames.length) {
                    this._newChanges = true;
                    for (const propName1 of propNames){
                        if (!this._toUpdate.has(propName1)) {
                            this._toUpdate.set(propName1, this[propName1]);
                        }
                    }
                }
                while(this._newChanges){
                    const changed = new Map();
                    for (const [name, value] of this._toUpdate.entries()){
                        if (this._props[name] === value && !propNames.includes(name)) {
                            allToUpdate.delete(name);
                            changed.delete(name);
                        } else {
                            allToUpdate.set(name, value);
                            changed.set(name, this._props[name]);
                            this._props[name] = value;
                        }
                    }
                    this._newChanges = false;
                    this._toUpdate.clear();
                    if (changed.size > 0) {
                        const doNotUpdate = await this.changed(changed) || [];
                        for (const name1 of changed.keys()){
                            if (doNotUpdate.includes(name1)) {
                                noUpdate[name1] = true;
                            } else {
                                delete noUpdate[name1];
                            }
                        }
                    }
                }
                const updated = new Map();
                for (const [name] of allToUpdate.entries()){
                    const value = this[name];
                    if (initialValues[name] !== value || propNames.includes(name)) {
                        this._setFromProp(name, value);
                        if (!noUpdate[name]) {
                            updated.set(name, initialValues[name]);
                        }
                    }
                }
                this._changing = false;
                if (updated.size > 0) {
                    if (!this._needsRehydrating) {
                        const updatedProps = [
                            ...updated.keys()
                        ];
                        const otherTriggers = {
                        };
                        for (const name1 of updatedProps){
                            const { triggers =[]  } = this.props[name1];
                            await this.updateTargets(name1);
                            for (const trigger of triggers){
                                otherTriggers[trigger] = true;
                            }
                        }
                        for (const name2 of Object.keys(otherTriggers)){
                            if (!updatedProps.includes(name2)) {
                                await this.updateTargets(name2);
                            }
                        }
                    }
                    this._updatePromise = null;
                    if (this._firstUpdate) {
                        this._firstUpdate = false;
                        await this.firstUpdated(updated);
                    }
                    await this.updated(updated);
                } else {
                    this._updatePromise = null;
                    this._firstUpdate = false;
                }
            });
        }
        changed(changed) {
        }
        updated(updated) {
        }
        firstUpdated(updated) {
        }
        async requestUpdate(props = []) {
            await this.updateDone();
            this.update(props);
        }
        async updateDone() {
            await this._updatePromise;
        }
    }
    return Wafer;
};
const updateTargets = async (apply, el, { value , targets =[]  })=>{
    for (const target of targets){
        const { selector , attribute , text , dom , property , use  } = target;
        const selectorVal = typeof selector === "function" ? selector(value) : selector;
        await apply(el, selectorVal, async (targetEl)=>{
            const useValue = use ? use(value, el, targetEl) : value;
            if (attribute) {
                if ([
                    null,
                    false,
                    void 0
                ].includes(useValue)) {
                    targetEl.removeAttribute(attribute);
                } else {
                    targetEl.setAttribute(attribute, useValue === true ? "" : useValue);
                }
            }
            if (property) {
                targetEl[property] = useValue;
            }
            if (text) {
                targetEl.textContent = useValue;
            }
            if (dom) {
                await dom(targetEl, useValue, el);
            }
        });
    }
};
const templateCache = new Map();
const stamp = (html, firstChild = false)=>{
    const trimmed = html.trim();
    let cached = templateCache.get(trimmed);
    if (!cached) {
        const template = document.createElement("template");
        template.innerHTML = trimmed;
        templateCache.set(trimmed, template);
        cached = template;
    }
    if (firstChild) {
        return cached.content.firstElementChild.cloneNode(true);
    }
    return cached.content.cloneNode(true);
};
const emit = (target, name, detail = {
}, opts = {
    bubbles: true,
    composed: true
})=>{
    target.dispatchEvent(new CustomEvent(name, {
        ...opts,
        detail
    }));
};
const repeat = ({ container , items , html , keyFn , targets =[] , init =null , events ={
}  })=>{
    const indexToKey = {
    };
    const keyMap = {
    };
    for (const [index, item] of items.entries()){
        const key = "" + keyFn(item, index);
        indexToKey[index] = key;
        keyMap[key] = {
            index,
            el: null
        };
    }
    const existingEls = {
    };
    const toRemove = [];
    for (const el of container.querySelectorAll(":scope> *[wafer-key]")){
        const key = el.getAttribute("wafer-key");
        if (key) {
            existingEls[key] = el;
            if (!keyMap[key]) {
                toRemove.push(el);
            } else {
                keyMap[key].el = el;
            }
        }
    }
    for (const el1 of toRemove){
        el1.remove();
    }
    const elementsToMove = [];
    const childrenKeys = [
        ...container.children
    ].map((child)=>child.getAttribute("wafer-key")
    );
    let targetIndex = 0;
    for (const [index1, item1] of items.entries()){
        const key = indexToKey[index1];
        const currentIndex = childrenKeys.indexOf(key);
        if (existingEls[key]) {
            updateTargets(apply, existingEls[key], {
                value: item1,
                targets
            });
            if (targetIndex !== currentIndex) {
                const distance = Math.abs(currentIndex - targetIndex);
                elementsToMove.push({
                    el: existingEls[key],
                    targetIndex,
                    distance
                });
            }
            targetIndex++;
        }
    }
    elementsToMove.sort((a, b)=>b.distance - a.distance
    );
    for (const item2 of elementsToMove){
        if (item2.targetIndex !== [
            ...container.children
        ].indexOf(item2.el)) {
            container.children[item2.targetIndex].after(item2.el);
        }
    }
    const reversedItems = items.slice().reverse();
    for (const [reversedIndex, item3] of reversedItems.entries()){
        const index2 = items.length - 1 - reversedIndex;
        const key = indexToKey[index2];
        if (!existingEls[key]) {
            const el2 = stamp(html, true);
            if (init) {
                init(el2, item3, index2);
            }
            updateTargets(apply, el2, {
                value: item3,
                targets: targets.concat({
                    selector: "self",
                    use: ()=>key
                    ,
                    attribute: "wafer-key"
                })
            });
            for (const selector of Object.keys(events)){
                const eventNames = Object.keys(events[selector]);
                for (const name of eventNames){
                    const def = events[selector][name];
                    bindEvent(el2, selector, name, def);
                }
            }
            const afterIndex = index2 + 1;
            const elAfter = keyMap[indexToKey[afterIndex]] && keyMap[indexToKey[afterIndex]].el;
            container.insertBefore(el2, elAfter || null);
            keyMap[indexToKey[index2]].el = el2;
        }
    }
};
const apply = (el, selector, func)=>{
    if (selector === "self") {
        func(el);
    } else {
        const shadow = selector[0] === "$";
        const doc = selector[0] === "@";
        const target = shadow ? el.shadowRoot || el : doc ? document : el;
        const targetSelector = shadow || doc ? selector.substr(1) : selector;
        for (const el2 of target.querySelectorAll(targetSelector)){
            func(el2);
        }
    }
};
const bindEvent = (el, selector, name, func)=>{
    let boundFn;
    let fnOpts = void 0;
    if (typeof func !== "function") {
        const { fn , target =el , opts ={
        }  } = func;
        fnOpts = opts;
        boundFn = fn.bind(target);
    } else {
        boundFn = func.bind(el);
    }
    apply(el, selector, (eventEl)=>{
        eventEl.addEventListener(name, boundFn, fnOpts);
    });
};
class WaferClient extends WaferMixin(HTMLElement) {
    static get supportsDSD() {
        return HTMLTemplateElement.prototype.hasOwnProperty("shadowRoot");
    }
    get events() {
        return {
        };
    }
    constructor({ shadow ="open"  } = {
    }){
        super();
        if (shadow) {
            if (!this.shadowRoot) {
                if (this._needsRehydrating) {
                    if (!this.constructor.supportsDSD) {
                        const template = this.querySelector("template[shadowroot]");
                        if (template) {
                            const shadowRoot = this.attachShadow({
                                mode: shadow
                            });
                            shadowRoot.appendChild(template.content);
                            template.remove();
                        }
                    }
                } else {
                    this.attachShadow({
                        mode: shadow
                    }).appendChild(stamp(this.constructor.template));
                }
            }
        }
        this.initialiseProps();
    }
    connectedCallback() {
        if (!this._connectedOnce) {
            if (!this.shadowRoot && !this._needsRehydrating) {
                this.appendChild(stamp(this.constructor.template));
            }
            this.setupPropValues();
            for (const selector of Object.keys(this.events)){
                const eventNames = Object.keys(this.events[selector]);
                for (const name of eventNames){
                    bindEvent(this, selector, name, this.events[selector][name]);
                }
            }
        }
        super._connectedOnce = true;
    }
    get _needsRehydrating() {
        return this._firstUpdate && this.hasAttribute("wafer-ssr");
    }
    updateTargets(name) {
        updateTargets(apply, this, {
            value: this._props[name],
            targets: this.props[name].targets
        });
    }
}
class MyElement extends WaferClient {
    static get template() {
        return `
      <span id="count"></span>
      <button id="dec">-</button>
      <button id="inc">+</button>
    `;
    }
    static get props() {
        return {
            count: {
                type: Number,
                reflect: true,
                initial: 10,
                targets: [
                    {
                        selector: '$#count',
                        text: true
                    }, 
                ]
            }
        };
    }
    get events() {
        return {
            '$#dec': {
                click: ()=>this.count--
            },
            '$#inc': {
                click: ()=>this.count++
            }
        };
    }
}
customElements.define('wafer-el', MyElement);
