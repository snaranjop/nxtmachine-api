export class User {
    fullName: string;
    email: string;
    age?: number;

    constructor(fullName: string, email: string, age?: number) {
        this.fullName = fullName;
        this.email = email;
        this.age = age;
    }
};