import { DocumentStore } from "ravendb";
import * as fs from "fs";
import * as express from "express";
import {Server, Path, GET, PathParam, POST, FormParam, PUT} from "typescript-rest";
import { UserResponse } from "./model/UserResponse";
import { User } from "./model/User";
import { Response } from "./model/Response";
import * as cors from 'cors';

// Db connection
const authOptions = {
    certificate: fs.readFileSync("src/db.certificate.pfx"),
    type: "pfx" as any
};

const store = new DocumentStore(["https://a.free.snpappspring.ravendb.cloud"], "nxtmachine-db", authOptions);
store.conventions.findCollectionNameForObjectLiteral = entity => entity["collection"];
store.initialize();

const session = store.openSession();

//API Routes
@Path("/user")
class UserService {
  @Path(":userID")
  @GET
  async getUser( @PathParam('userID') userID: string): Promise<UserResponse> {
    const user = await session.load("users/"+userID) as any;
    if (user) {
        return new UserResponse(user.fullName, user.email, user.id.split("/")[1], user.age, "success");
    } else {
        return new UserResponse( null, null, null, null, "non-existent-user");
    }
  }

  @Path("")
  @POST
  async updateUser(userBody: any): Promise<any> {
    const user = await session.load("users/"+userBody.userID) as User;
    if (user) {
        user.fullName = userBody.fullName;
        user.email = userBody.email;
        user.age = userBody.age;
        await session.saveChanges();
        return new Response("success");
    } else {
        return new Response("non-existing-user");
    }
  }

  @Path("")
  @PUT
  async createUser(user: any): Promise<any> {
    const newUser = new User(user.fullName, user.email, user.age); 
    await session.store(newUser);
    await session.saveChanges();
    return newUser;
  }
}

let app: express.Application = express();
const allowedOrigins = ['http://localhost:3000'];

const options: cors.CorsOptions = {
  origin: allowedOrigins
};

app.use(cors(options));

Server.buildServices(app);

app.listen(3000, function() {
  console.log('Rest Server listening on port 3000!');
});