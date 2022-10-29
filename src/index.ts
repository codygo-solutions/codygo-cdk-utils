import { execSync } from "child_process";
import { App, CfnOutput, Stack, StackProps, Tags } from "aws-cdk-lib";
import { pascalCase } from "pascal-case";
import { Construct } from "constructs";

export function setStage(app: App, stageName: string) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  (app as any).stageName = stageName; // workaround readonly
  Tags.of(app).add("stage", app.stageName);
}

export function stagedName(scope: Construct, name: string) {
  return pascalCase(App.of(scope)?.stageName + " " + name);
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
