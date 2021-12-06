import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { readFileSync, writeFileSync } from 'fs';

export const enableSwagger = (app) => {
    const { version } = JSON.parse(readFileSync('package.json', 'utf-8'));

    const options = new DocumentBuilder()
        .setTitle(`Auth`)
        .setDescription(`release date`)
        .setVersion(`v${version}`)
        .addBearerAuth()
        .build();
    const document = SwaggerModule.createDocument(app, options);
    writeFileSync('./dist/swagger.json', JSON.stringify(document, null, 4));
    SwaggerModule.setup('docs', app, document);
};
