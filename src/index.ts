import { DocumentStore } from "ravendb";
import fs from "fs";
import express from "express";
import {Server, Path, GET, PathParam, POST, FormParam, PUT} from "typescript-rest";
import { UserResponse } from "./model/UserResponse";
import { User } from "./model/User";
import { Response } from "./model/Response";
import { Example } from "typescript-rest-swagger"
import swaggerUI from 'swagger-ui-express'
import swaggerSetup from './swaggerFiles/swagger.json'
import cors from 'cors';

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
@Path("")
class HomeService {
  @Path("")
  @GET
  getHome(): string {
    return "Welcome to nxtmachine API";
  }
}

@Path("/user")
class UserService {
  /**
   * This endpoint allows to retrieve an user form the database. If the user doesn't exist the field status will be "non-existing-user" otherwise, it will be "success"
   * @param userID ID of the user to retrieve
   */
   @Example<UserResponse>(
    {
      "fullName": "Sergio Naranjo",
      "email": "snp@gmail.com",
      "age": 22,
      "userID": "193-A",
      "status": "success"
    }
  )
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

  /**
   * This endpoint allows to retrieve an user form the database. If the user doesn't exist the field status will be "non-existing-user" otherwise, it will be "success"
   * @param userID ID of the user to retrieve
   */
   @Example<UserResponse>(
    {
      "fullName": "Sergio Naranjo",
      "email": "snp@gmail.com",
      "age": 22,
      "userID": "193-A",
      "status": "success"
    }
  )
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

  /**
   * This service allows to create a new user. If the operation is successful the status will be "success". If there is any error the error msg will be in the status field.
   * @param user User object with the info to create the user
   */
   @Example(
    {
      "fullName": "Sergio Naranjo",
      "email": "snp@gmail.com",
      "age": 35,
      "id": "users/353-A"
    }
  )
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

//Cors config
const allowedOrigins = ['http://nxtmachine.appspringtech.com/'];
const options: cors.CorsOptions = {
  origin: allowedOrigins
};
app.use(cors(options));

//Swagger Config
app.use('/api', swaggerUI.serve, swaggerUI.setup(swaggerSetup));

//User services build
Server.buildServices(app);

const port = process.env.PORT || 3000

//Run Server
app.listen(port, function() {
  console.log('Rest Server listening on port 3000!');
});