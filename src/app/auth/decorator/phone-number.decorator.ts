import { isNumberString, isString, registerDecorator } from 'class-validator';

export function IsPhoneNumber() {
  return function (object: any, propertyName: string) {
    registerDecorator({
      name: 'isPhoneNumber',
      target: object.constructor,
      propertyName: propertyName,
      options: {
        message:
          "phone number must be a number string which have 11 digits and start with '09'",
      },
      validator: {
        validate(value: string) {
          if (!isString(value)) {
            return false;
          }
          if (!isNumberString(value)) {
            return false;
          }
          const isPhoneNumber = value.substr(0, 2) === '09';
          const hasCorrectLength = value.length === 11;
          return isPhoneNumber && hasCorrectLength;
        },
      },
    });
  };
}
