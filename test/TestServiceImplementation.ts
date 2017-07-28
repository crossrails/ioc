import { TestService } from './TestService'

export default class TestServiceImplementation implements TestService {
    handled: boolean;

    constructor() {
        this.handled = false;
    }

    test(): void {
        this.handled = true;
    }
}

