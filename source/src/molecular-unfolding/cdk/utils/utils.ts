/*
Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/


import {
  aws_iam as iam,
  aws_kms as kms,
  aws_ec2 as ec2,
  CfnResource,
  Stack,
  Arn,
  ArnFormat,
  IAspect,
  CfnCondition,
} from 'aws-cdk-lib';

import {
  IConstruct,
} from 'constructs';


export class ChangePublicSubnet implements IAspect {
  visit(node: IConstruct): void {
    if (node instanceof ec2.CfnSubnet && node.mapPublicIpOnLaunch) {
      node.addPropertyOverride('MapPublicIpOnLaunch', false);
    }
  }
}

export class AddCfnNag implements IAspect {
  visit(node: IConstruct): void {
    if (
      node.node.path.endsWith('/Custom::S3AutoDeleteObjectsCustomResourceProvider/Handler') ||
            node.node.path.endsWith('/EventRuleCustomResourceProvider/framework-onEvent/Resource')
    ) {
      (node as CfnResource).addMetadata('cfn_nag', {
        rules_to_suppress: [{
          id: 'W58',
          reason: 'the lambda is auto generated by CDK',
        },
        {
          id: 'W89',
          reason: 'the lambda is auto generated by CDK',
        }],
      });
    }
    if (
      node.node.path.endsWith('/CreateEventRuleFunc/Resource')
    ) {
      (node as CfnResource).addMetadata('cfn_nag', {
        rules_to_suppress: [{
          id: 'W89',
          reason: 'Lambda is used as custom resource',
        }],
      });
    } else if (
      node.node.path.endsWith('/AggResultLambda/Resource') ||
            node.node.path.endsWith('/TaskParametersLambda/Resource') ||
            node.node.path.endsWith('/DeviceAvailableCheckLambda/Resource') ||
            node.node.path.endsWith('/WaitForTokenLambda/Resource') ||
            node.node.path.endsWith('/BraketTaskEventHandler/ParseBraketResultLambda/Resource')
    ) {
      (node as CfnResource).addMetadata('cfn_nag', {
        rules_to_suppress: [{
          id: 'W58',
          reason: 'the lambda already have the cloudwatch permission',
        }],
      });
    } else if (node.node.path.endsWith('/ccBatchJobRole/DefaultPolicy/Resource') ||
            node.node.path.endsWith('/qcBatchJobRole/DefaultPolicy/Resource') ||
            node.node.path.endsWith('/createModelBatchJobRole/DefaultPolicy/Resource') ||
            node.node.path.endsWith('/batchExecutionRole/DefaultPolicy/Resource') ||
            node.node.path.endsWith('/TaskParametersLambdaRole/DefaultPolicy/Resource') ||
            node.node.path.endsWith('/DeviceAvailableCheckLambdaRole/DefaultPolicy/Resource') ||
            node.node.path.endsWith('/ParseBraketResultLambdaRole/DefaultPolicy/Resource') ||
            node.node.path.endsWith('/AggResultLambdaRole/DefaultPolicy/Resource') ||
            node.node.path.endsWith('/WaitForTokenLambdaRole/DefaultPolicy/Resource') ||
            node.node.path.endsWith('/Notebook/NotebookRole/DefaultPolicy/Resource') ||
            node.node.path.endsWith('/BucketNotificationsHandler050a0587b7544547bf325f094a3db834/Role/DefaultPolicy/Resource') ||
            node.node.path.endsWith('/CreateEventRuleFuncRole/DefaultPolicy/Resource')
    ) {
      (node as CfnResource).addMetadata('cfn_nag', {
        rules_to_suppress: [{
          id: 'W12',
          reason: 'some permissions are not resource-level permissions',
        }],
      });
    } else if (node.node.path.endsWith('/CCStateMachine/Role/DefaultPolicy/Resource') ||
            node.node.path.endsWith('/QCStateMachine/Role/DefaultPolicy/Resource')
    ) {
      (node as CfnResource).addMetadata('cfn_nag', {
        rules_to_suppress: [{
          id: 'W12',
          reason: 'the policy about log group is generated by CDK',
        }],
      });
    } else if (
      node.node.path.endsWith('/BatchEvaluationStateMachine/Role/DefaultPolicy/Resource') ||
            node.node.path.endsWith('/RunCCAndQCStateMachine/Role/DefaultPolicy/Resource') ||
            node.node.path.endsWith('/QCDeviceStateMachine/Role/DefaultPolicy/Resource')
    ) {
      (node as CfnResource).addMetadata('cfn_nag', {
        rules_to_suppress: [{
          id: 'W12',
          reason: 'the policy about log group is generated by CDK',
        },
        {
          id: 'W76',
          reason: 'The policy is generated automatically by CDK',
        }],
      });
    } else if (node.node.path.endsWith('/AccessLogS3Bucket/Resource')) {
      (node as CfnResource).addMetadata('cfn_nag', {
        rules_to_suppress: [{
          id: 'W35',
          reason: 'this is access log bucket',
        }],
      });
    } else if (node.node.path.endsWith('/batchSg/Resource') ||
            node.node.path.endsWith('/lambdaSg/Resource')
    ) {
      (node as CfnResource).addMetadata('cfn_nag', {
        rules_to_suppress: [{
          id: 'W5',
          reason: 'cidr open to world on egress',
        }],
      });
    } else if (
      node.node.path.endsWith('/VPC/EcrDockerEndpoint/SecurityGroup/Resource') ||
            node.node.path.endsWith('/VPC/AthenaEndpoint/SecurityGroup/Resource') ||
            node.node.path.endsWith('/VPC/BraketEndpoint/SecurityGroup/Resource')
    ) {
      (node as CfnResource).addMetadata('cfn_nag', {
        rules_to_suppress: [{
          id: 'W5',
          reason: 'generated by CDK',
        },
        {
          id: 'W40',
          reason: 'generated by CDK',
        }],
      });

    } else if (node.node.path.endsWith('/SNSKey/Resource')) {
      (node as CfnResource).addMetadata('cfn_nag', {
        rules_to_suppress: [{
          id: 'F76',
          reason: 'Key for SNS, add constraint in conditions',
        }],
      });
    }
  }
}

export function grantKmsKeyPerm(key: kms.IKey, logGroupName ? : string): void {
  key.addToResourcePolicy(new iam.PolicyStatement({
    principals: [new iam.ServicePrincipal('logs.amazonaws.com')],
    actions: [
      'kms:Encrypt*',
      'kms:ReEncrypt*',
      'kms:Decrypt*',
      'kms:GenerateDataKey*',
      'kms:Describe*',
    ],
    resources: [
      '*',
    ],
    conditions: {
      ArnLike: {
        'kms:EncryptionContext:aws:logs:arn': Arn.format({
          service: 'logs',
          resource: 'log-group',
          resourceName: logGroupName ? logGroupName : '*',
          arnFormat: ArnFormat.COLON_RESOURCE_NAME,
        }, Stack.of(key)),
      },
    },
  }));
}

export class AddCondition implements IAspect {
  private condition: CfnCondition
  constructor(condition: CfnCondition) {
    this.condition = condition;
  }
  visit(node: IConstruct): void {
    if (node.node.path.endsWith('/CreateEventRuleFunc/ServiceRole/DefaultPolicy/Resource') ||
        node.node.path.endsWith('/EventBridgeRole/DefaultPolicy/Resource') ||
        (node.node.path.indexOf('/EventRuleCustomResourceProvider/framework-onEvent/') > -1)
    ) {
      if ((node as CfnResource).cfnOptions) {
        (node as CfnResource).cfnOptions.condition = this.condition;
      }
    }
  }
}

export class AddSSMPolicyToRole implements IAspect {
  //arn:aws:iam::aws:policy/AmazonSSMManagedInstanceCore
  visit(node: IConstruct): void {
    if (node instanceof iam.Role && node.node.path.endsWith('/Ecs-Instance-Role')) {
      node.addManagedPolicy(
        iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonSSMManagedInstanceCore'),
      );
    }
  }
}


export class ChangePolicyName implements IAspect {
  visit(node: IConstruct): void {
    const region = Stack.of(node).region;
    if (node instanceof iam.CfnPolicy && node.node.path.endsWith('QuickSightServiceRole/Policy/Resource')) {
      node.policyName = node.policyName + '-' + region;
    }
  }
}

