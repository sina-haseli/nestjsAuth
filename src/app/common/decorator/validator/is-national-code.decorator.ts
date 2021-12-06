import { registerDecorator } from 'class-validator';
import { verifyIranianNationalId } from 'persian-tools2';

export function IsNationalCode() {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'IsNationalCode',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message: 'national code is not valid',
      },
      validator: {
        validate(value: string) {
          return verifyIranianNationalId(value);
        },
      },
    });
  };
}
