import {inject, bind, rebind} from './di'

interface Interface {
}

interface TestService {
    handled: boolean;
    test(): void
}

class TestService {

}

class TestServiceImplementation implements TestService {
    handled: boolean;

    constructor() {
        this.handled = false;
    }

    test(): void {
        this.handled = true;
        console.log('test called on TestService')
    }
}

class TestInjectable {
    @inject
    service: TestService

    constructor() {
    }
}

describe("Container", () => {
    
    it("calls a handler method when its subscribed event is published", () => {
        //singleton bind: will use the instance passed in 
        bind(TestService).toSingleton(new TestServiceImplementation);
        //singleton lazy bind: only works with no arg constructors, if you want to delay the construction of the singleton to until its needed - will create an instance on first use and reuse for all other injections 
        bind(TestService).toSingleton(TestServiceImplementation);
        //factory bind: if you want each injection to have its own instance - will create an instance on first use in every injection   
        bind(TestService).toFactory(() => new TestServiceImplementation);
        //lazy factory bind: if you want to delay the construction of a singleton who's constructor requires args to until its needed - will create an instance on first use and reuse for all other injections     
        bind(TestService).toFactory(() => {
            const instance = new TestServiceImplementation;
            rebind(TestService).toSingleton(instance);
            return instance;
        });
        const instance = new TestInjectable;
        instance.service.test();
        expect(instance.service.handled).toBe(true);
    })
})