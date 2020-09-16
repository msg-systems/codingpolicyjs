interface User {
  name: string;
  id: number;
}

class UserAccount {
  name: string;
  id: number;

  constructor(nameX: string, idX: number) {
    this.name = nameX;
    this.id = idX;
  }

  wrapInArray  (obj: string | string[]) {
    if (typeof obj === "string") {
      return [   obj];
    } else {
      return obj;
    }
  }
}

const user: User = new UserAccount("Murphy", 1);

function getAdminUser(): User {
  return new UserAccount("Admin", 10)
}


console.log("User", user)
console.log("Admin", getAdminUser())
