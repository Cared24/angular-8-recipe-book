export class User {
    constructor(
        public email: string,
        public id: string, 
        private _token: string,
        private _tokenExpirationDate: Date
    ) {}

    /*
        Now what is a getter? A getter here looks like a function, we add parentheses and then a function body
        but you actually access it like a property, so you will be able to do something like user.token.
        This is how you will be able to access this because it's a getter, it's a special type of property
        you could say, it's a property where you can write code that runs when you try to access this property,
    */
    get token() {
        if (!this._tokenExpirationDate || new Date() > this._tokenExpirationDate) {
            return null;
        }
        return this._token;
    }
}