import { FilePath } from "../check/file-path/mod.ts";
import { markdownPropsParser } from "./markdown-props-parser/mod.ts";
import { publishNotion } from "./notion/mod.ts";
import { publishZendesk } from "./zendesk/mod.ts";

type Props = {
  filePaths: FilePath[];
  zendeskApiAuthHeader?: string;
  notionApiKey?: string;
};

function publish({ filePaths, zendeskApiAuthHeader, notionApiKey }: Props) {
  filePaths.map(async (filePath) => {
    const { props, body } = await markdownPropsParser(filePath);
    props.dist;
    switch (props.dist.toLocaleLowerCase()) {
      case "zendesk":
        if (!zendeskApiAuthHeader) {
          throw Error(
            "need Zendesk API authotization header (base64 encoded).",
          );
        }
        publishZendesk(zendeskApiAuthHeader, props, body);
        break;
      case "notion":
        if (!notionApiKey) {
          throw Error("need notion API key.");
        }
        publishNotion(notionApiKey, props, body);
        break;
      default:
        break;
    }
  });
}

function help() {
  console.log(`documentaly publish help`);
}

export { help, publish };