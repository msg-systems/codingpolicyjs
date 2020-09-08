class UserAccount {
    constructor(nameX, idX) {
        this.name = nameX;
        this.id = idX;
    }
    wrapInArray(obj) {
        if (typeof obj === "string") {
            return [obj];
        }
        else {
            return obj;
        }
    }
}
const user = new UserAccount("Murphy", 1);
function getAdminUser() {
    return new UserAccount("Admin", 10);
}
console.log("User", user);
console.log("Admin", getAdminUser());
