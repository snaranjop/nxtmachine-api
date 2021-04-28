export class UserResponse {
    fullName: string;
    email: string;
    age: number;
    userID: string;
    status: string;

    constructor(fullName: string, email: string,  userID: string, age: number, status: string) {
        this.fullName = fullName;
        this.email = email;
        this.age = age;
        this.userID = userID;
        this.status = status;
    }
};