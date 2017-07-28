import 'reflect-metadata';

const factories = new Map<Function, () => Object>();

export interface BindTo<T> {
    toSingleton(binding: T): T
    toFactory(method: () => T): () => T
}

export function bind<T>(type: Function): BindTo<T> {
    if(factories.has(type)) throw new Error(`${type.name} already bound to ${factories.get(type)!().constructor.name}, call rebind(${type.name}) instead if that was your intention`)
    return rebind<T>(type);
}

export function rebind<T>(type: Function): BindTo<T> {
    return {
        toSingleton: (binding: T) => { factories.set(type, () => binding); return binding; },
        toFactory: (method:() => T) => { factories.set(type, method); return method; },
    }
}
export function unbind(type: ObjectConstructor) {
    factories.delete(type);
}

export function clearBindings() {
    factories.clear();
}

export function obtain<T>(type: ObjectConstructor): T {
    const factory = factories.get(type);
    if(factory == undefined) throw new Error(`Cannot obtain ${type.name} because it has not been bound, call bind(${type.name}).toSingleton({})`);
    return factory() as T;
}

export function inject(target: Object, propertyKey: string | symbol): void {
    Object.defineProperty(target, propertyKey, { configurable: true, get: function(this: Object) {
        const type = Reflect.getMetadata("design:type", target, propertyKey);
        if(type == Object) throw new Error(`Cannot inject ${target.constructor.name}.${propertyKey} as it is an interface type not known at runtime, use declaration merging to preserve type information (define an empty class of the same name)`);
        if(!factories.has(type)) throw new Error(`Cannot inject ${target.constructor.name}.${propertyKey} because ${type.name} has not been bound, call bind(${type.name}).toSingleton({})`);
        let binding = obtain(type); 
        Object.defineProperty(this, propertyKey, {value: binding});
        return binding;
    }});
}


