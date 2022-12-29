import $ from "https://deno.land/x/dax@0.17.0/mod.ts";
import {parse as yamlParse} from "https://deno.land/std@0.170.0/encoding/yaml.ts";

async function findMarkdownFilePath(filePaths: string[]): Promise<string[]> {
  const commands = filePaths.map(filePath => $`find ${filePath} -name '*.md'`.text())
  const commandResults = await Promise.all(commands)
  return commandResults.flatMap(commandResult => commandResult.split('\n'))
}

/** extract YAML header from markdown file */
function extructYamlHeader(markdownFilePath: string): Promise<string> {
  return $`awk '/^---$/ {p=!p; if (p) {next}; if (!p) {exit}} {if (!p) {exit}} 1' ${markdownFilePath}`.text()
}

async function markdownFilePathConfigMap(markdownFilePaths: string[]) {
  const markdownFilePathAndConfigTaples = await Promise.all(markdownFilePaths.map(async markdownFilePath => {
    const yamlHeader = await extructYamlHeader(markdownFilePath)
    const config = yamlParse(yamlHeader) ?? {}
    return [markdownFilePath, config] as const
  }))
  return new Map(markdownFilePathAndConfigTaples)
}

function reverseMap(map: Map<string, {dependentFilePath: string[]}>): Map<string, string[]> {
  const reversedMap = new Map<string, string[]>();

  for (const [key, value] of map.entries()) {
    if (!value.dependentFilePath) {
      continue
    }
    value.dependentFilePath.forEach((val) => {
      if (reversedMap.has(val)) {
        reversedMap.get(val)?.push(key);
      } else {
        reversedMap.set(val, [key]);
      }
    });
  }

  return reversedMap;
}

async function main() {
  const markdownFilePaths = await findMarkdownFilePath(['.']) 
  const map = await markdownFilePathConfigMap(markdownFilePaths)
  return {
    filePathDependencyMap: map,
    dependencyFilePath: reverseMap(map as any),
  }
}


// console.log(markdownFilePaths)

// console.log(map)
// console.log(reverseMap(map as any))


export { main as documentDependencies }
