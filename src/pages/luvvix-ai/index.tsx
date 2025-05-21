
import App from "../../luvvix-chatbot-muse-33-main/src/App";
import { LuvvixAIAuthProvider } from "./LuvvixAIAuthProvider";

const LuvvixAIPage = () => {
  return (
    <LuvvixAIAuthProvider>
      <App />
    </LuvvixAIAuthProvider>
  );
};

export default LuvvixAIPage;
