import { execSync } from "child_process";
import { App, CfnOutput, Stack, StackProps, Tags } from "aws-cdk-lib";
import { pascalCase } from "pascal-case";
import { Construct } from "constructs";

export function setStage(app: App, stageName: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (app as any).stageName = stageName; // workaround readonly
  Tags.of(app).add("stage", app.stageName);
}

export function getStage(scope: Construct): string{
  const stage = App.of(scope)?.stageName;
  if(!stage){
    throw new Error("No stage name or no app")
  }
  return stage;
}

export function stagedName(scope: Construct, name: string) {
  return pascalCase(getStage(scope) + " " + name);
}

export function exportStackOutputs(scope: Construct, outputs: Record<string, string>){
  Object.entries(outputs).forEach(([key, value]) => {
    new CfnOutput(scope, key, {
      value,
      exportName: stagedName(scope, key)
    })
  }) 
}

export function importStackOutput<T extends Object>(scope: Construct, otherStackBaseName: string, outputKeys: Array<keyof T>): Record<keyof T, string>{
  const record = {} as Record<keyof T, string>;
  const stage = getStage(scope);
  outputKeys.forEach(key => {
    record[key] = getStackOutput(stage + "-" + otherStackBaseName, key as string);
  })

  //Fn.importValue(`dev-BackendStack.${key as string}`)
  //Fn.importValue(stagedName(scope, key as string)) // 
  ///  //
  return record;
}


export function exec(cmd: string): string {
  return execSync(cmd).toString().trim();
}


export function getStackOutput(stackName: string, outputKey: string) {
  return exec(
    `aws cloudformation describe-stacks --query "Stacks[?StackName=='${stackName}'][].Outputs[?OutputKey=='${outputKey}'].OutputValue" --output text`
  );
}

export function getRegion() {
  return exec(`aws configure get region`);
}

export function getAccount() {
  return exec(
    `aws sts get-caller-identity --no-verify-ssl --query 'Account' --output text`
  );
}
