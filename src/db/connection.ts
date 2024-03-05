import { connect } from "mongoose";
import { DB_NAME } from "../constants";

export const createConnection = async () => {
    try {
        const connectionInstance = await connect(
            (process.env.DB_URI + "/" + DB_NAME) as string
        );
        console.log(
            "DB Connected 🌐.\nHOST: " + connectionInstance.connection.host
        );
    } catch (error) {
        console.log("DataBase connection error");
    }
};
