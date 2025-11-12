import SwaggerUI from "swagger-ui-react";
import "swagger-ui-react/swagger-ui.css";

export const ApiDocsPage = () => {

    return <SwaggerUI url="/openapi.yaml" />;

}

export default ApiDocsPage;