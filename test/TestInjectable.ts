import { inject } from '../di'
import { TestService } from './TestService'

export default class TestInjectable {
    @inject
    readonly service: TestService

    constructor() {
    }
}