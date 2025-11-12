import dynamoose from "dynamoose";

const AppSchema = new dynamoose.Schema({
    PK: { type: String, hashKey: true },
    SK: { type: String, rangeKey: true },

    id: String,
    name: String,
    startDate: String,
    description: String
}, { saveUnknown: false, timestamps: true });

export const AppModel = dynamoose.model("DynamoDBDevContractFirst", AppSchema);