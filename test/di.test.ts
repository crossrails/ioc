import { bind, rebind, clearBindings } from '../di'
import { TestService } from './TestService'
import TestServiceImplementation from './TestServiceImplementation'
import TestInjectable from './TestInjectable'

describe("Container", () => {
    
    afterEach(() => {
        clearBindings();
    });
      
      it("supports singleton bind", () => {
        //singleton bind: will use the instance passed in 
        bind(TestService).toSingleton(new TestServiceImplementation);
        const instance = new TestInjectable;
        instance.service.test();
        expect(instance.service.handled).toBe(true);
        const instance2 = new TestInjectable;
        instance2.service.test();
        expect(instance2.service.handled).toBe(true);
        expect(instance2.service).toBe(instance.service)
    })

    it("supports factory bind", () => {
        const factory = jest.fn();        
        //factory bind: if you want each injection to have its own instance - will create an instance on first use in every injection   
        bind(TestService).toFactory(factory.mockImplementation(() => new TestServiceImplementation));
        const instance = new TestInjectable;
        expect(factory).not.toHaveBeenCalled();
        instance.service.test();
        expect(factory).toHaveBeenCalledTimes(1);
        expect(instance.service.handled).toBe(true);
        const instance2 = new TestInjectable;
        instance2.service.test();
        expect(factory).toHaveBeenCalledTimes(2);
        expect(instance2.service.handled).toBe(true);
        expect(instance2.service).not.toBe(instance.service)
    })

    it("supports singleton lazy bind pattern", () => {
        const factory = jest.fn();        
        //singleton lazy bind pattern: if you want to delay the construction of the singleton to until its needed - will create an instance on first use and reuse for all other injections 
        bind(TestService).toFactory(factory.mockImplementation(() => rebind(TestService).toSingleton(new TestServiceImplementation)));
        const instance = new TestInjectable;
        expect(factory).not.toHaveBeenCalled();
        instance.service.test();
        expect(factory).toHaveBeenCalledTimes(1);
        expect(instance.service.handled).toBe(true);
        const instance2 = new TestInjectable;
        instance2.service.test();
        expect(factory).toHaveBeenCalledTimes(1);
        expect(instance2.service.handled).toBe(true);
        expect(instance2.service).toBe(instance.service)
    })

})