import { GeneratorService } from './generator.service';
export declare class GeneratorController {
    private generatorService;
    constructor(generatorService: GeneratorService);
    generate(req: any, body: any): Promise<any>;
}
