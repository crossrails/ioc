import 'reflect-metadata';

const factories = new Map<Function, () => {new (): Object} | Object>();

function isType(binding: {new (): Object} | Object, type: any): binding is {new (): Object} {
    return !(binding instanceof type);
}

export interface BindTo<T, S extends T> {
    toSingleton(binding: {new (): T} | S): void
    toFactory(method: () => S): void
}

export function bind<T, S extends T>(type: {new (...args: any[]): T}): BindTo<T, S> {
    if(factories.has(type)) throw new Error(`${type.name} already bound to ${factories.get(type)!().constructor.name}, call rebind(${type.name}) instead if that was your intention`)
    return rebind(type);
}

export function rebind<T, S extends T>(type: {new (...args: any[]): T}): BindTo<T, S> {
    return {
        toSingleton: () => (binding: {new (): T} | S) => factories.set(type, () => binding),
        toFactory: () => (method:() => S) => factories.set(type, method)
    }
}

export function unbind<T>(type: {new (...args: any[]): T}) {
    factories.delete(type);
}

export function clearBindings() {
    factories.clear();
}

export function obtain<T, S extends T>(type: {new (...args: any[]): T}): S {
    const factory = factories.get(type);
    if(factory == undefined) throw new Error(`Cannot obtain ${type.name} because it has not been bound, call bind(${type.name}).toSingleton({})`);
    let binding = factory();
    if(isType(binding, type)) {
        binding = new binding;
        factories.set(type, () => binding);
    } 
    return binding as S;
}

export function inject(target: Object, propertyKey: string | symbol): void {
    Object.defineProperty(target, propertyKey, { configurable: true, get: function(this: Object) {
        const type = Reflect.getMetadata("design:type", target, propertyKey);
        if(type == Object) throw new Error(`Cannot inject ${target.constructor.name}.${propertyKey} as it is an interface type not known at runtime, use declaration merging to preserve type (define an empty class of the same name)`);
        if(!factories.has(type)) throw new Error(`Cannot inject ${target.constructor.name}.${propertyKey} because ${type.name} has not been bound, call bind(${type.name}).toSingleton({})`);
        let binding = obtain(type); 
        Object.defineProperty(this, propertyKey, {value: binding});
        return binding;
    }});
}


