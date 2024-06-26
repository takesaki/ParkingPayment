import * as path from "path";
import * as cdk from "aws-cdk-lib";
import { CfnOutput } from "aws-cdk-lib";
import * as apigateway from "aws-cdk-lib/aws-apigateway";
import * as ec2 from "aws-cdk-lib/aws-ec2";
import * as iam from "aws-cdk-lib/aws-iam";
import * as lambda from "aws-cdk-lib/aws-lambda";
import * as eventsources from "aws-cdk-lib/aws-lambda-event-sources";
import * as sqs from "aws-cdk-lib/aws-sqs";
import { Construct } from "constructs";
import * as dotenv from "dotenv";
//import * as cloud9 from '@aws-cdk/aws-cloud9-alpha';

dotenv.config({ path: "../.env" });
dotenv.config({ path: ".env_param" });
/* .env file --------------------
STACK_NAME=PPBS-stack-amoy
RESOURCE_HEADER=-PAMOY
--------------------------------*/

export class MyStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props: cdk.StackProps = {}) {
    super(scope, id, props);

    //--------------------------------------------------------------------------------
    // common environment variables
    // -------------------------------------------------------------------------------
    const RESOURCE_HEADER = process.env.RESOURCE_HEADER || "-PR";

    //--------------------------------------------------------------------------------
    // VPC
    // --------------------------------------------------------------------------------

    const vpc = new ec2.Vpc(this, "VPC", {
      maxAzs: 2, // Default is all AZs in the region
    });

    //--------------------------------------------------------------------------------
    // Endpoints
    // --------------------------------------------------------------------------------

    const secretsManagerVpcEndpoint = vpc.addInterfaceEndpoint("SecretsManagerEndpoint", {
      service: ec2.InterfaceVpcEndpointAwsService.SECRETS_MANAGER,
    });

    secretsManagerVpcEndpoint.addToPolicy(
      new iam.PolicyStatement({
        principals: [new iam.AnyPrincipal()],
        actions: ["secretsmanager:*"],
        resources: ["*"],
      })
    );

    //--------------------------------------------------------------------------------
    // Security Group
    // --------------------------------------------------------------------------------

    // Create a new security group for the Lambda function
    const lambdaSecurityGroup = new ec2.SecurityGroup(this, "LambdaSecurityGroup", {
      vpc: vpc,
      description: "Allow all outbound and inbound traffic for Lambda function",
      allowAllOutbound: true, // Allow all outbound traffic
    });
    // Allow all inbound traffic
    lambdaSecurityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.allTraffic());

    //--------------------------------------------------------------------------------
    // Lambda Layer
    // --------------------------------------------------------------------------------

    const layer = new lambda.LayerVersion(this, "PPBS_LambdaLayer", {
      code: lambda.Code.fromAsset(path.join(__dirname, "lambda/bundle")),
      compatibleRuntimes: [lambda.Runtime.NODEJS_18_X],
      compatibleArchitectures: [lambda.Architecture.X86_64],
      description: "PPBS Lambda Layer",
    });

    //--------------------------------------------------------------------------------
    // Lambda Function 11
    // --------------------------------------------------------------------------------

    const myLF11 = new lambda.Function(this, "lambda11-BackMaster", {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset(path.join(__dirname, "lambda/lambda11")),
      handler: "index.handler",
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        TZ: "Asia/Tokyo",
      },
      layers: [layer],
      vpc: vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [lambdaSecurityGroup],
    });

    //--------------------------------------------------------------------------------
    // Lambda Function 12
    // --------------------------------------------------------------------------------

    const myLF12 = new lambda.Function(this, "lambda12-BackSub", {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset(path.join(__dirname, "lambda/lambda12")),
      handler: "index.handler",
      timeout: cdk.Duration.seconds(120),
      memorySize: 512,
      environment: {
        TZ: "Asia/Tokyo",
      },
      layers: [layer],
      vpc: vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [lambdaSecurityGroup],
    });

    //--------------------------------------------------------------------------------
    // Lambda Function 21
    // --------------------------------------------------------------------------------

    const myLF21 = new lambda.Function(this, "lambda21-DepositMaster", {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset(path.join(__dirname, "lambda/lambda21")),
      handler: "index.handler",
      timeout: cdk.Duration.seconds(35),
      memorySize: 512,
      environment: {
        TZ: "Asia/Tokyo",
      },
      layers: [layer],
      vpc: vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [lambdaSecurityGroup],
    });

    //--------------------------------------------------------------------------------
    // Lambda Function 22
    // --------------------------------------------------------------------------------

    const myLF22 = new lambda.Function(this, "lambda22-DepositSub", {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset(path.join(__dirname, "lambda/lambda22")),
      handler: "index.handler",
      timeout: cdk.Duration.seconds(180),
      memorySize: 512,
      environment: {
        TZ: "Asia/Tokyo",
      },
      layers: [layer],
      vpc: vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [lambdaSecurityGroup],
    });

    //--------------------------------------------------------------------------------
    // Lambda Function 31
    // --------------------------------------------------------------------------------

    const myLF31 = new lambda.Function(this, "lambda31-EntryMaster", {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset(path.join(__dirname, "lambda/lambda31")),
      handler: "index.handler",
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        TZ: "Asia/Tokyo",
      },
      layers: [layer],
      vpc: vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [lambdaSecurityGroup],
    });

    //--------------------------------------------------------------------------------
    // Lambda Function 32
    // --------------------------------------------------------------------------------

    const myLF32 = new lambda.Function(this, "lambda32-EntrySub", {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset(path.join(__dirname, "lambda/lambda32")),
      handler: "index.handler",
      timeout: cdk.Duration.seconds(180),
      memorySize: 512,
      environment: {
        TZ: "Asia/Tokyo",
      },
      layers: [layer],
      vpc: vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [lambdaSecurityGroup],
    });

    //--------------------------------------------------------------------------------
    // Lambda Function 41
    // --------------------------------------------------------------------------------

    const myLF41 = new lambda.Function(this, "lambda41-ExitMaster", {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset(path.join(__dirname, "lambda/lambda41")),
      handler: "index.handler",
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        TZ: "Asia/Tokyo",
      },
      layers: [layer],
      vpc: vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [lambdaSecurityGroup],
    });

    //--------------------------------------------------------------------------------
    // Lambda Function 42
    // --------------------------------------------------------------------------------

    const myLF42 = new lambda.Function(this, "lambda42-ExitSub", {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset(path.join(__dirname, "lambda/lambda42")),
      handler: "index.handler",
      timeout: cdk.Duration.seconds(180),
      memorySize: 512,
      environment: {
        TZ: "Asia/Tokyo",
      },
      layers: [layer],
      vpc: vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [lambdaSecurityGroup],
    });

    //--------------------------------------------------------------------------------
    // Lambda Function 51
    // --------------------------------------------------------------------------------

    const myLF51 = new lambda.Function(this, "lambda51-WithdrawMaster", {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset(path.join(__dirname, "lambda/lambda51")),
      handler: "index.handler",
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        TZ: "Asia/Tokyo",
      },
      layers: [layer],
      vpc: vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [lambdaSecurityGroup],
    });

    //--------------------------------------------------------------------------------
    // Lambda Function 52
    // --------------------------------------------------------------------------------

    const myLF52 = new lambda.Function(this, "lambda52-WithdrawSub", {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset(path.join(__dirname, "lambda/lambda52")),
      handler: "index.handler",
      timeout: cdk.Duration.seconds(180),
      memorySize: 512,
      environment: {
        TZ: "Asia/Tokyo",
      },
      layers: [layer],
      vpc: vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [lambdaSecurityGroup],
    });

    //--------------------------------------------------------------------------------
    // Lambda Function A1
    // --------------------------------------------------------------------------------

    const myLFA1 = new lambda.Function(this, "lambdaA1-ToolMaster", {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset(path.join(__dirname, "lambda/lambdaA1")),
      handler: "index.handler",
      timeout: cdk.Duration.seconds(30),
      memorySize: 512,
      environment: {
        TZ: "Asia/Tokyo",
      },
      layers: [layer],
      vpc: vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [lambdaSecurityGroup],
    });

    //--------------------------------------------------------------------------------
    // Lambda Function A2
    // --------------------------------------------------------------------------------

    const myLFA2 = new lambda.Function(this, "lambdaA2-ToolSub", {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset(path.join(__dirname, "lambda/lambdaA2")),
      handler: "index.handler",
      timeout: cdk.Duration.seconds(180),
      memorySize: 512,
      environment: {
        TZ: "Asia/Tokyo",
      },
      layers: [layer],
      vpc: vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [lambdaSecurityGroup],
    });

    //--------------------------------------------------------------------------------
    // Lambda Function Z
    // --------------------------------------------------------------------------------

    const myLFZ = new lambda.Function(this, "lambdaZ-Info", {
      runtime: lambda.Runtime.NODEJS_18_X,
      code: lambda.Code.fromAsset(path.join(__dirname, "lambda/lambdaZ")),
      handler: "index.handler",
      timeout: cdk.Duration.seconds(180),
      memorySize: 512,
      environment: {
        TZ: "Asia/Tokyo",
      },
      layers: [layer],
      vpc: vpc,
      vpcSubnets: {
        subnetType: ec2.SubnetType.PRIVATE_WITH_EGRESS,
      },
      securityGroups: [lambdaSecurityGroup],
    });

    //--------------------------------------------------------------------------------
    // Secrets Manager
    // --------------------------------------------------------------------------------

    const secretsManagerPolicy = new iam.PolicyStatement({
      actions: ["secretsmanager:GetSecretValue"],
      resources: ["*"],
    });

    myLF11.addToRolePolicy(secretsManagerPolicy);
    myLF12.addToRolePolicy(secretsManagerPolicy);
    myLF21.addToRolePolicy(secretsManagerPolicy);
    myLF22.addToRolePolicy(secretsManagerPolicy);
    myLF31.addToRolePolicy(secretsManagerPolicy);
    myLF32.addToRolePolicy(secretsManagerPolicy);
    myLF41.addToRolePolicy(secretsManagerPolicy);
    myLF42.addToRolePolicy(secretsManagerPolicy);
    myLF51.addToRolePolicy(secretsManagerPolicy);
    myLF52.addToRolePolicy(secretsManagerPolicy);
    myLFA1.addToRolePolicy(secretsManagerPolicy);
    myLFA2.addToRolePolicy(secretsManagerPolicy);
    myLFZ.addToRolePolicy(secretsManagerPolicy);

    new CfnOutput(this, "Output", {
      value: vpc.vpcId,
    });

    //--------------------------------------------------------------------------------
    // API-Gateway
    // --------------------------------------------------------------------------------
    // Create a new REST API
    const API_name = "PPBS-APIs" + RESOURCE_HEADER;
    const api = new apigateway.RestApi(this, "PPBS-API", {
      restApiName: API_name,
      description: "Park Payment Back APIs",
      endpointTypes: [apigateway.EndpointType.REGIONAL],
      deployOptions: {
        stageName: "v1",
        loggingLevel: apigateway.MethodLoggingLevel.INFO,
        dataTraceEnabled: true,
      },
      defaultCorsPreflightOptions: {
        allowOrigins: apigateway.Cors.ALL_ORIGINS,
        allowMethods: apigateway.Cors.ALL_METHODS,
        allowHeaders: apigateway.Cors.DEFAULT_HEADERS,
        statusCode: 200,
      },
      cloudWatchRole: true,
    });

    // resource for CreateVandM
    const CVM = api.root.addResource("CreateVandM");
    CVM.addMethod("POST", new apigateway.LambdaIntegration(myLF11), {
      apiKeyRequired: true,
    });

    // resource for Deposit
    const DEPOSIT = api.root.addResource("Deposit");
    DEPOSIT.addMethod("POST", new apigateway.LambdaIntegration(myLF21), {
      apiKeyRequired: true,
    });

    // resource for Entry
    const ENTRY = api.root.addResource("Entry");
    ENTRY.addMethod("POST", new apigateway.LambdaIntegration(myLF31), {
      apiKeyRequired: true,
    });

    // resource for Exit
    const EXIT = api.root.addResource("Exit");
    EXIT.addMethod("POST", new apigateway.LambdaIntegration(myLF41), {
      apiKeyRequired: true,
    });

    // resource for Withdraw
    const WITHDRAW = api.root.addResource("Withdraw");
    WITHDRAW.addMethod("POST", new apigateway.LambdaIntegration(myLF51), {
      apiKeyRequired: true,
    });

    // resource for PPC
    //// resource for PPC/mint
    const PPCmater = api.root.addResource("PPC");
    const PPCmint = PPCmater.addResource("mint");
    PPCmint.addMethod("POST", new apigateway.LambdaIntegration(myLFA1), {
      apiKeyRequired: true,
    });

    // resource for Information
    const INFO = api.root.addResource("Info");
    const INFOgetA = INFO.addResource("getAddr");
    INFOgetA.addMethod("POST", new apigateway.LambdaIntegration(myLFZ), {
      apiKeyRequired: true,
    });
    const INFOgetP = INFO.addResource("getParkPayInfo");
    INFOgetP.addMethod("POST", new apigateway.LambdaIntegration(myLFZ), {
      apiKeyRequired: true,
    });

    const plan_name = "UsagePlan" + RESOURCE_HEADER;
    const plan = api.addUsagePlan("UsagePlan", {
      name: plan_name,
      throttle: {
        rateLimit: 100,
        burstLimit: 500,
      },
      quota: {
        limit: 500000,
        period: apigateway.Period.MONTH,
      },
    });

    const key = api.addApiKey("ApiKey");
    plan.addApiKey(key);
    plan.addApiStage({
      stage: api.deploymentStage,
    });

    // Output the URL of the API Gateway
    new CfnOutput(this, "ApiUrl", {
      value: api.url ?? "Something went wrong with the API Gateway",
    });

    //--------------------------------------------------------------------------------
    // SQS 1x
    // --------------------------------------------------------------------------------
    // Create the Dead Letter Queue
    const deadLetterQueue = new sqs.Queue(this, "CMD1xDLQ-", {
      fifo: true,
      visibilityTimeout: cdk.Duration.seconds(180),
      retentionPeriod: cdk.Duration.days(14), // 14 days
      contentBasedDeduplication: true,
    });

    const queue = new sqs.Queue(this, "CMD1xQueue-", {
      fifo: true,
      visibilityTimeout: cdk.Duration.seconds(180), // default visibility timeout
      retentionPeriod: cdk.Duration.hours(3),
      deduplicationScope: sqs.DeduplicationScope.MESSAGE_GROUP,
      fifoThroughputLimit: sqs.FifoThroughputLimit.PER_MESSAGE_GROUP_ID,
      contentBasedDeduplication: true,
      deadLetterQueue: {
        maxReceiveCount: 3, // Send to Dead Letter Queue after 3 failed attempts
        queue: deadLetterQueue,
      },
    });

    // Output the URL of the SQS Queue
    new CfnOutput(this, "CMD1xQueueUrl", {
      value: queue.queueUrl,
    });

    // Grant the Lambda function the necessary permissions to send messages to the SQS Queue
    queue.grantSendMessages(myLF11);

    // Trigger the Lambda function when a new message is added to the SQS Queue
    myLF12.addEventSource(
      new eventsources.SqsEventSource(queue, {
        batchSize: 1, // Number of messages to process from the queue at once
        reportBatchItemFailures: true,
        maxConcurrency: 8,
      })
    );
    myLF12.addPermission("Allow SQS", {
      action: "lambda:InvokeFunction",
      principal: new iam.ServicePrincipal("sqs.amazonaws.com"),
      sourceArn: queue.queueArn,
    });

    //--------------------------------------------------------------------------------
    // SQS 2x
    // --------------------------------------------------------------------------------
    // Create the Dead Letter Queue
    const deadLetterQueue2 = new sqs.Queue(this, "CMD2xDLQ-", {
      fifo: true,
      visibilityTimeout: cdk.Duration.seconds(180),
      retentionPeriod: cdk.Duration.days(14), // 14 days
      contentBasedDeduplication: true,
    });

    const queue2 = new sqs.Queue(this, "CMD2xQueue-", {
      fifo: true,
      visibilityTimeout: cdk.Duration.seconds(180), // default visibility timeout
      retentionPeriod: cdk.Duration.hours(3),
      deduplicationScope: sqs.DeduplicationScope.MESSAGE_GROUP,
      fifoThroughputLimit: sqs.FifoThroughputLimit.PER_MESSAGE_GROUP_ID,
      contentBasedDeduplication: true,
      deadLetterQueue: {
        maxReceiveCount: 3, // Send to Dead Letter Queue after 3 failed attempts
        queue: deadLetterQueue2,
      },
    });
    // Output the URL of the SQS Queue
    new CfnOutput(this, "CMD2xQueueUrl", {
      value: queue2.queueUrl,
    });

    // Grant the Lambda function the necessary permissions to send messages to the SQS Queue
    queue2.grantSendMessages(myLF21);

    // Trigger the Lambda function when a new message is added to the SQS Queue
    myLF22.addEventSource(
      new eventsources.SqsEventSource(queue2, {
        batchSize: 1, // Number of messages to process from the queue at once
        reportBatchItemFailures: true,
        maxConcurrency: 8,
      })
    );
    myLF22.addPermission("Allow SQS", {
      action: "lambda:InvokeFunction",
      principal: new iam.ServicePrincipal("sqs.amazonaws.com"),
      sourceArn: queue2.queueArn,
    });

    //--------------------------------------------------------------------------------
    // SQS 3x
    // --------------------------------------------------------------------------------
    // Create the Dead Letter Queue
    const deadLetterQueue3 = new sqs.Queue(this, "CMD3xDLQ-", {
      fifo: true,
      visibilityTimeout: cdk.Duration.seconds(180),
      retentionPeriod: cdk.Duration.days(14), // 14 days
      contentBasedDeduplication: true,
    });
    const queue3 = new sqs.Queue(this, "CMD3xQueue-", {
      fifo: true,
      visibilityTimeout: cdk.Duration.seconds(180), // default visibility timeout
      retentionPeriod: cdk.Duration.hours(3),
      deduplicationScope: sqs.DeduplicationScope.MESSAGE_GROUP,
      fifoThroughputLimit: sqs.FifoThroughputLimit.PER_MESSAGE_GROUP_ID,
      contentBasedDeduplication: true,
      deadLetterQueue: {
        maxReceiveCount: 3, // Send to Dead Letter Queue after 3 failed attempts
        queue: deadLetterQueue3,
      },
    });

    // Output the URL of the SQS Queue
    new CfnOutput(this, "CMD3xQueueUrl", {
      value: queue3.queueUrl,
    });

    // Grant the Lambda function the necessary permissions to send messages to the SQS Queue
    queue3.grantSendMessages(myLF31);

    // Trigger the Lambda function when a new message is added to the SQS Queue
    myLF32.addEventSource(
      new eventsources.SqsEventSource(queue3, {
        batchSize: 1, // Number of messages to process from the queue at once
        reportBatchItemFailures: true,
        maxConcurrency: 8,
      })
    );
    myLF32.addPermission("Allow SQS", {
      action: "lambda:InvokeFunction",
      principal: new iam.ServicePrincipal("sqs.amazonaws.com"),
      sourceArn: queue3.queueArn,
    });

    //--------------------------------------------------------------------------------
    // SQS 4x
    // --------------------------------------------------------------------------------
    // Create the Dead Letter Queue
    const deadLetterQueue4 = new sqs.Queue(this, "CMD4xDLQ-", {
      fifo: true,
      visibilityTimeout: cdk.Duration.seconds(180),
      retentionPeriod: cdk.Duration.days(14), // 14 days
      contentBasedDeduplication: true,
    });
    const queue4 = new sqs.Queue(this, "CMD4xQueue-", {
      fifo: true,
      visibilityTimeout: cdk.Duration.seconds(180), // default visibility timeout
      retentionPeriod: cdk.Duration.hours(3),
      deduplicationScope: sqs.DeduplicationScope.MESSAGE_GROUP,
      fifoThroughputLimit: sqs.FifoThroughputLimit.PER_MESSAGE_GROUP_ID,
      contentBasedDeduplication: true,
      deadLetterQueue: {
        maxReceiveCount: 3, // Send to Dead Letter Queue after 3 failed attempts
        queue: deadLetterQueue4,
      },
    });

    // Output the URL of the SQS Queue
    new CfnOutput(this, "CMD4xQueueUrl", {
      value: queue4.queueUrl,
    });

    // Grant the Lambda function the necessary permissions to send messages to the SQS Queue
    queue4.grantSendMessages(myLF41);

    // Trigger the Lambda function when a new message is added to the SQS Queue
    myLF42.addEventSource(
      new eventsources.SqsEventSource(queue4, {
        batchSize: 1, // Number of messages to process from the queue at once
        reportBatchItemFailures: true,
        maxConcurrency: 8,
      })
    );
    myLF42.addPermission("Allow SQS", {
      action: "lambda:InvokeFunction",
      principal: new iam.ServicePrincipal("sqs.amazonaws.com"),
      sourceArn: queue4.queueArn,
    });

    //--------------------------------------------------------------------------------
    // SQS 5x
    // --------------------------------------------------------------------------------
    // Create the Dead Letter Queue
    const deadLetterQueue5 = new sqs.Queue(this, "CMD5xDLQ-", {
      fifo: true,
      visibilityTimeout: cdk.Duration.seconds(180),
      retentionPeriod: cdk.Duration.days(14), // 14 days
      contentBasedDeduplication: true,
    });
    const queue5 = new sqs.Queue(this, "CMD5xQueue-", {
      fifo: true,
      visibilityTimeout: cdk.Duration.seconds(180), // default visibility timeout
      retentionPeriod: cdk.Duration.hours(3),
      deduplicationScope: sqs.DeduplicationScope.MESSAGE_GROUP,
      fifoThroughputLimit: sqs.FifoThroughputLimit.PER_MESSAGE_GROUP_ID,
      contentBasedDeduplication: true,
      deadLetterQueue: {
        maxReceiveCount: 3, // Send to Dead Letter Queue after 3 failed attempts
        queue: deadLetterQueue5,
      },
    });

    // Output the URL of the SQS Queue
    new CfnOutput(this, "CMD5xQueueUrl", {
      value: queue5.queueUrl,
    });

    // Grant the Lambda function the necessary permissions to send messages to the SQS Queue
    queue5.grantSendMessages(myLF51);

    // Trigger the Lambda function when a new message is added to the SQS Queue
    myLF52.addEventSource(
      new eventsources.SqsEventSource(queue5, {
        batchSize: 1, // Number of messages to process from the queue at once
        reportBatchItemFailures: true,
        maxConcurrency: 8,
      })
    );
    myLF52.addPermission("Allow SQS", {
      action: "lambda:InvokeFunction",
      principal: new iam.ServicePrincipal("sqs.amazonaws.com"),
      sourceArn: queue5.queueArn,
    });

    //--------------------------------------------------------------------------------
    // SQS Ax
    // --------------------------------------------------------------------------------
    // Create the Dead Letter Queue
    const deadLetterQueueA = new sqs.Queue(this, "CMDAxDLQ-", {
      fifo: true,
      visibilityTimeout: cdk.Duration.seconds(180),
      retentionPeriod: cdk.Duration.days(14), // 14 days
      contentBasedDeduplication: true,
    });
    const queueA = new sqs.Queue(this, "CMDAxQueue-", {
      fifo: true,
      visibilityTimeout: cdk.Duration.seconds(180), // default visibility timeout
      retentionPeriod: cdk.Duration.hours(3),
      deduplicationScope: sqs.DeduplicationScope.MESSAGE_GROUP,
      fifoThroughputLimit: sqs.FifoThroughputLimit.PER_MESSAGE_GROUP_ID,
      contentBasedDeduplication: true,
      deadLetterQueue: {
        maxReceiveCount: 3, // Send to Dead Letter Queue after 3 failed attempts
        queue: deadLetterQueueA,
      },
    });

    // Output the URL of the SQS Queue
    new CfnOutput(this, "CMDAxQueueUrl", {
      value: queueA.queueUrl,
    });

    // Grant the Lambda function the necessary permissions to send messages to the SQS Queue
    queueA.grantSendMessages(myLFA1);

    // Trigger the Lambda function when a new message is added to the SQS Queue
    myLFA2.addEventSource(
      new eventsources.SqsEventSource(queueA, {
        batchSize: 1, // Number of messages to process from the queue at once
        reportBatchItemFailures: true,
        maxConcurrency: 8,
      })
    );
    myLFA2.addPermission("Allow SQS", {
      action: "lambda:InvokeFunction",
      principal: new iam.ServicePrincipal("sqs.amazonaws.com"),
      sourceArn: queueA.queueArn,
    });

    //--------------------------------------------------------------------------------
    // Lambda Environment Variables
    // -------------------------------------------------------------------------------

    const API_GATEWAY_APIKEY = process.env.API_GATEWAY_APIKEY as string;
    const API_GATEWAY_URL = process.env.API_GATEWAY_URL as string;
    const TOKENPROXY_CA = process.env.TOKENPROXY_CA as string;
    const NFCADDRESSREGISTRYPROXY_CA = process.env.NFCADDRESSREGISTRYPROXY_CA as string;
    const PARKINGPAYMENTPROXY_CA = process.env.PARKINGPAYMENTPROXY_CA as string;
    const FIREBLOCKS_VID_SERVICEOWNER_ADDR = process.env.FIREBLOCKS_VID_SERVICEOWNER_ADDR as string;
    const FIREBLOCKS_VID_SERVICEOWNER = process.env.FIREBLOCKS_VID_SERVICEOWNER as string;
    const EXPLOERE = process.env.EXPLOERE as string;
    const POLYGON_RPC_URL = process.env.POLYGON_RPC_URL as string;
    const FIREBLOCKS_ASSET_ID = process.env.FIREBLOCKS_ASSET_ID as string;
    const FIREBLOCKS_ASSET_ID_MYTOKEN = process.env.FIREBLOCKS_ASSET_ID_MYTOKEN as string;
    const FIREBLOCKS_API_KEY_SIGNER = process.env.FIREBLOCKS_API_KEY_SIGNER as string;
    const FIREBLOCKS_URL = process.env.FIREBLOCKS_URL as string;
    const ALCHEMY_HTTPS = process.env.ALCHEMY_HTTPS as string;
    const DOMAIN_SEPARATOR_NAME_TOKEN = process.env.DOMAIN_SEPARATOR_NAME_TOKEN as string;
    const DOMAIN_SEPARATOR_VERSION_TOKEN = process.env.DOMAIN_SEPARATOR_VERSION_TOKEN as string;

    // -----------------------------------------------------------------
    // Lambda Function 11 ----------------------------------------------
    // -----------------------------------------------------------------
    myLF11.addEnvironment("SQSxx_URL", queue.queueUrl);
    myLF11.addEnvironment("API_GATEWAY_APIKEY", API_GATEWAY_APIKEY);
    myLF11.addEnvironment("API_GATEWAY_URL", API_GATEWAY_URL);
    myLF11.addEnvironment("TOKENPROXY_CA", TOKENPROXY_CA);
    myLF11.addEnvironment("NFCADDRESSREGISTRYPROXY_CA", NFCADDRESSREGISTRYPROXY_CA);
    myLF11.addEnvironment("FIREBLOCKS_VID_SERVICEOWNER_ADDR", FIREBLOCKS_VID_SERVICEOWNER_ADDR);
    myLF11.addEnvironment("FIREBLOCKS_VID_SERVICEOWNER", FIREBLOCKS_VID_SERVICEOWNER);
    myLF11.addEnvironment("EXPLOERE", EXPLOERE);
    myLF11.addEnvironment("POLYGON_RPC_URL", POLYGON_RPC_URL);
    myLF11.addEnvironment("FIREBLOCKS_ASSET_ID", FIREBLOCKS_ASSET_ID);
    myLF11.addEnvironment("FIREBLOCKS_ASSET_ID_MYTOKEN", FIREBLOCKS_ASSET_ID_MYTOKEN);
    myLF11.addEnvironment("FIREBLOCKS_API_KEY_SIGNER", FIREBLOCKS_API_KEY_SIGNER);
    myLF11.addEnvironment("FIREBLOCKS_URL", FIREBLOCKS_URL);
    myLF11.addEnvironment("ALCHEMY_HTTPS", ALCHEMY_HTTPS);

    // -----------------------------------------------------------------
    // Lambda Function 12 ----------------------------------------------
    // -----------------------------------------------------------------
    myLF12.addEnvironment("SQSxx_URL", queue.queueUrl);
    myLF12.addEnvironment("API_GATEWAY_APIKEY", API_GATEWAY_APIKEY);
    myLF12.addEnvironment("API_GATEWAY_URL", API_GATEWAY_URL);
    myLF12.addEnvironment("TOKENPROXY_CA", TOKENPROXY_CA);
    myLF12.addEnvironment("NFCADDRESSREGISTRYPROXY_CA", NFCADDRESSREGISTRYPROXY_CA);
    myLF12.addEnvironment("FIREBLOCKS_VID_SERVICEOWNER_ADDR", FIREBLOCKS_VID_SERVICEOWNER_ADDR);
    myLF12.addEnvironment("FIREBLOCKS_VID_SERVICEOWNER", FIREBLOCKS_VID_SERVICEOWNER);
    myLF12.addEnvironment("EXPLOERE", EXPLOERE);
    myLF12.addEnvironment("POLYGON_RPC_URL", POLYGON_RPC_URL);
    myLF12.addEnvironment("FIREBLOCKS_ASSET_ID", FIREBLOCKS_ASSET_ID);
    myLF12.addEnvironment("FIREBLOCKS_ASSET_ID_MYTOKEN", FIREBLOCKS_ASSET_ID_MYTOKEN);
    myLF12.addEnvironment("FIREBLOCKS_API_KEY_SIGNER", FIREBLOCKS_API_KEY_SIGNER);
    myLF12.addEnvironment("FIREBLOCKS_URL", FIREBLOCKS_URL);
    myLF12.addEnvironment("ALCHEMY_HTTPS", ALCHEMY_HTTPS);

    // -----------------------------------------------------------------
    // Lambda Function 21 ----------------------------------------------
    // -----------------------------------------------------------------
    myLF21.addEnvironment("SQSxx_URL", queue2.queueUrl);
    myLF21.addEnvironment("API_GATEWAY_APIKEY", API_GATEWAY_APIKEY);
    myLF21.addEnvironment("API_GATEWAY_URL", API_GATEWAY_URL);
    myLF21.addEnvironment("DOMAIN_SEPARATOR_NAME_TOKEN", DOMAIN_SEPARATOR_NAME_TOKEN);
    myLF21.addEnvironment("DOMAIN_SEPARATOR_VERSION_TOKEN", DOMAIN_SEPARATOR_VERSION_TOKEN);
    myLF21.addEnvironment("PARKINGPAYMENTPROXY_CA", PARKINGPAYMENTPROXY_CA);
    myLF21.addEnvironment("TOKENPROXY_CA", TOKENPROXY_CA);
    myLF21.addEnvironment("NFCADDRESSREGISTRYPROXY_CA", NFCADDRESSREGISTRYPROXY_CA);
    myLF21.addEnvironment("FIREBLOCKS_VID_SERVICEOWNER_ADDR", FIREBLOCKS_VID_SERVICEOWNER_ADDR);
    myLF21.addEnvironment("FIREBLOCKS_VID_SERVICEOWNER", FIREBLOCKS_VID_SERVICEOWNER);
    myLF21.addEnvironment("EXPLOERE", EXPLOERE);
    myLF21.addEnvironment("POLYGON_RPC_URL", POLYGON_RPC_URL);
    myLF21.addEnvironment("FIREBLOCKS_ASSET_ID", FIREBLOCKS_ASSET_ID);
    myLF21.addEnvironment("FIREBLOCKS_ASSET_ID_MYTOKEN", FIREBLOCKS_ASSET_ID_MYTOKEN);
    myLF21.addEnvironment("FIREBLOCKS_API_KEY_SIGNER", FIREBLOCKS_API_KEY_SIGNER);
    myLF21.addEnvironment("FIREBLOCKS_URL", FIREBLOCKS_URL);
    myLF21.addEnvironment("ALCHEMY_HTTPS", ALCHEMY_HTTPS);

    // -----------------------------------------------------------------
    // Lambda Function 22 ----------------------------------------------
    // -----------------------------------------------------------------
    myLF22.addEnvironment("SQSxx_URL", queue2.queueUrl);
    myLF22.addEnvironment("API_GATEWAY_APIKEY", API_GATEWAY_APIKEY);
    myLF22.addEnvironment("API_GATEWAY_URL", API_GATEWAY_URL);
    myLF22.addEnvironment("DOMAIN_SEPARATOR_NAME_TOKEN", DOMAIN_SEPARATOR_NAME_TOKEN);
    myLF22.addEnvironment("DOMAIN_SEPARATOR_VERSION_TOKEN", DOMAIN_SEPARATOR_VERSION_TOKEN);
    myLF22.addEnvironment("PARKINGPAYMENTPROXY_CA", PARKINGPAYMENTPROXY_CA);
    myLF22.addEnvironment("TOKENPROXY_CA", TOKENPROXY_CA);
    myLF22.addEnvironment("NFCADDRESSREGISTRYPROXY_CA", NFCADDRESSREGISTRYPROXY_CA);
    myLF22.addEnvironment("FIREBLOCKS_VID_SERVICEOWNER_ADDR", FIREBLOCKS_VID_SERVICEOWNER_ADDR);
    myLF22.addEnvironment("FIREBLOCKS_VID_SERVICEOWNER", FIREBLOCKS_VID_SERVICEOWNER);
    myLF22.addEnvironment("EXPLOERE", EXPLOERE);
    myLF22.addEnvironment("POLYGON_RPC_URL", POLYGON_RPC_URL);
    myLF22.addEnvironment("FIREBLOCKS_ASSET_ID", FIREBLOCKS_ASSET_ID);
    myLF22.addEnvironment("FIREBLOCKS_ASSET_ID_MYTOKEN", FIREBLOCKS_ASSET_ID_MYTOKEN);
    myLF22.addEnvironment("FIREBLOCKS_API_KEY_SIGNER", FIREBLOCKS_API_KEY_SIGNER);
    myLF22.addEnvironment("FIREBLOCKS_URL", FIREBLOCKS_URL);
    myLF22.addEnvironment("ALCHEMY_HTTPS", ALCHEMY_HTTPS);

    // -----------------------------------------------------------------
    // Lambda Function 31 ----------------------------------------------
    // -----------------------------------------------------------------
    myLF31.addEnvironment("SQSxx_URL", queue3.queueUrl);
    myLF31.addEnvironment("API_GATEWAY_APIKEY", API_GATEWAY_APIKEY);
    myLF31.addEnvironment("API_GATEWAY_URL", API_GATEWAY_URL);
    myLF31.addEnvironment("PARKINGPAYMENTPROXY_CA", PARKINGPAYMENTPROXY_CA);
    myLF31.addEnvironment("TOKENPROXY_CA", TOKENPROXY_CA);
    myLF31.addEnvironment("NFCADDRESSREGISTRYPROXY_CA", NFCADDRESSREGISTRYPROXY_CA);
    myLF31.addEnvironment("FIREBLOCKS_VID_SERVICEOWNER_ADDR", FIREBLOCKS_VID_SERVICEOWNER_ADDR);
    myLF31.addEnvironment("FIREBLOCKS_VID_SERVICEOWNER", FIREBLOCKS_VID_SERVICEOWNER);
    myLF31.addEnvironment("EXPLOERE", EXPLOERE);
    myLF31.addEnvironment("POLYGON_RPC_URL", POLYGON_RPC_URL);
    myLF31.addEnvironment("FIREBLOCKS_ASSET_ID", FIREBLOCKS_ASSET_ID);
    myLF31.addEnvironment("FIREBLOCKS_ASSET_ID_MYTOKEN", FIREBLOCKS_ASSET_ID_MYTOKEN);
    myLF31.addEnvironment("FIREBLOCKS_API_KEY_SIGNER", FIREBLOCKS_API_KEY_SIGNER);
    myLF31.addEnvironment("FIREBLOCKS_URL", FIREBLOCKS_URL);
    myLF31.addEnvironment("ALCHEMY_HTTPS", ALCHEMY_HTTPS);

    // -----------------------------------------------------------------
    // Lambda Function 32 ----------------------------------------------
    // -----------------------------------------------------------------
    myLF32.addEnvironment("SQSxx_URL", queue3.queueUrl);
    myLF32.addEnvironment("API_GATEWAY_APIKEY", API_GATEWAY_APIKEY);
    myLF32.addEnvironment("API_GATEWAY_URL", API_GATEWAY_URL);
    myLF32.addEnvironment("PARKINGPAYMENTPROXY_CA", PARKINGPAYMENTPROXY_CA);
    myLF32.addEnvironment("TOKENPROXY_CA", TOKENPROXY_CA);
    myLF32.addEnvironment("NFCADDRESSREGISTRYPROXY_CA", NFCADDRESSREGISTRYPROXY_CA);
    myLF32.addEnvironment("FIREBLOCKS_VID_SERVICEOWNER_ADDR", FIREBLOCKS_VID_SERVICEOWNER_ADDR);
    myLF32.addEnvironment("FIREBLOCKS_VID_SERVICEOWNER", FIREBLOCKS_VID_SERVICEOWNER);
    myLF32.addEnvironment("EXPLOERE", EXPLOERE);
    myLF32.addEnvironment("POLYGON_RPC_URL", POLYGON_RPC_URL);
    myLF32.addEnvironment("FIREBLOCKS_ASSET_ID", FIREBLOCKS_ASSET_ID);
    myLF32.addEnvironment("FIREBLOCKS_ASSET_ID_MYTOKEN", FIREBLOCKS_ASSET_ID_MYTOKEN);
    myLF32.addEnvironment("FIREBLOCKS_API_KEY_SIGNER", FIREBLOCKS_API_KEY_SIGNER);
    myLF32.addEnvironment("FIREBLOCKS_URL", FIREBLOCKS_URL);
    myLF32.addEnvironment("ALCHEMY_HTTPS", ALCHEMY_HTTPS);

    // -----------------------------------------------------------------
    // Lambda Function 41 ----------------------------------------------
    // -----------------------------------------------------------------
    myLF41.addEnvironment("SQSxx_URL", queue4.queueUrl);
    myLF41.addEnvironment("API_GATEWAY_APIKEY", API_GATEWAY_APIKEY);
    myLF41.addEnvironment("API_GATEWAY_URL", API_GATEWAY_URL);
    myLF41.addEnvironment("PARKINGPAYMENTPROXY_CA", PARKINGPAYMENTPROXY_CA);
    myLF41.addEnvironment("TOKENPROXY_CA", TOKENPROXY_CA);
    myLF41.addEnvironment("NFCADDRESSREGISTRYPROXY_CA", NFCADDRESSREGISTRYPROXY_CA);
    myLF41.addEnvironment("FIREBLOCKS_VID_SERVICEOWNER_ADDR", FIREBLOCKS_VID_SERVICEOWNER_ADDR);
    myLF41.addEnvironment("FIREBLOCKS_VID_SERVICEOWNER", FIREBLOCKS_VID_SERVICEOWNER);
    myLF41.addEnvironment("EXPLOERE", EXPLOERE);
    myLF41.addEnvironment("POLYGON_RPC_URL", POLYGON_RPC_URL);
    myLF41.addEnvironment("FIREBLOCKS_ASSET_ID", FIREBLOCKS_ASSET_ID);
    myLF41.addEnvironment("FIREBLOCKS_ASSET_ID_MYTOKEN", FIREBLOCKS_ASSET_ID_MYTOKEN);
    myLF41.addEnvironment("FIREBLOCKS_API_KEY_SIGNER", FIREBLOCKS_API_KEY_SIGNER);
    myLF41.addEnvironment("FIREBLOCKS_URL", FIREBLOCKS_URL);
    myLF41.addEnvironment("ALCHEMY_HTTPS", ALCHEMY_HTTPS);

    // -----------------------------------------------------------------
    // Lambda Function 42 ----------------------------------------------
    // -----------------------------------------------------------------
    myLF42.addEnvironment("SQSxx_URL", queue4.queueUrl);
    myLF42.addEnvironment("API_GATEWAY_APIKEY", API_GATEWAY_APIKEY);
    myLF42.addEnvironment("API_GATEWAY_URL", API_GATEWAY_URL);
    myLF42.addEnvironment("PARKINGPAYMENTPROXY_CA", PARKINGPAYMENTPROXY_CA);
    myLF42.addEnvironment("TOKENPROXY_CA", TOKENPROXY_CA);
    myLF42.addEnvironment("NFCADDRESSREGISTRYPROXY_CA", NFCADDRESSREGISTRYPROXY_CA);
    myLF42.addEnvironment("FIREBLOCKS_VID_SERVICEOWNER_ADDR", FIREBLOCKS_VID_SERVICEOWNER_ADDR);
    myLF42.addEnvironment("FIREBLOCKS_VID_SERVICEOWNER", FIREBLOCKS_VID_SERVICEOWNER);
    myLF42.addEnvironment("EXPLOERE", EXPLOERE);
    myLF42.addEnvironment("POLYGON_RPC_URL", POLYGON_RPC_URL);
    myLF42.addEnvironment("FIREBLOCKS_ASSET_ID", FIREBLOCKS_ASSET_ID);
    myLF42.addEnvironment("FIREBLOCKS_ASSET_ID_MYTOKEN", FIREBLOCKS_ASSET_ID_MYTOKEN);
    myLF42.addEnvironment("FIREBLOCKS_API_KEY_SIGNER", FIREBLOCKS_API_KEY_SIGNER);
    myLF42.addEnvironment("FIREBLOCKS_URL", FIREBLOCKS_URL);
    myLF42.addEnvironment("ALCHEMY_HTTPS", ALCHEMY_HTTPS);

    // -----------------------------------------------------------------
    // Lambda Function 51 ----------------------------------------------
    // -----------------------------------------------------------------
    myLF51.addEnvironment("SQSxx_URL", queue5.queueUrl);
    myLF51.addEnvironment("API_GATEWAY_APIKEY", API_GATEWAY_APIKEY);
    myLF51.addEnvironment("API_GATEWAY_URL", API_GATEWAY_URL);
    myLF51.addEnvironment("PARKINGPAYMENTPROXY_CA", PARKINGPAYMENTPROXY_CA);
    myLF51.addEnvironment("TOKENPROXY_CA", TOKENPROXY_CA);
    myLF51.addEnvironment("NFCADDRESSREGISTRYPROXY_CA", NFCADDRESSREGISTRYPROXY_CA);
    myLF51.addEnvironment("FIREBLOCKS_VID_SERVICEOWNER_ADDR", FIREBLOCKS_VID_SERVICEOWNER_ADDR);
    myLF51.addEnvironment("FIREBLOCKS_VID_SERVICEOWNER", FIREBLOCKS_VID_SERVICEOWNER);
    myLF51.addEnvironment("EXPLOERE", EXPLOERE);
    myLF51.addEnvironment("POLYGON_RPC_URL", POLYGON_RPC_URL);
    myLF51.addEnvironment("FIREBLOCKS_ASSET_ID", FIREBLOCKS_ASSET_ID);
    myLF51.addEnvironment("FIREBLOCKS_ASSET_ID_MYTOKEN", FIREBLOCKS_ASSET_ID_MYTOKEN);
    myLF51.addEnvironment("FIREBLOCKS_API_KEY_SIGNER", FIREBLOCKS_API_KEY_SIGNER);
    myLF51.addEnvironment("FIREBLOCKS_URL", FIREBLOCKS_URL);
    myLF51.addEnvironment("ALCHEMY_HTTPS", ALCHEMY_HTTPS);

    // -----------------------------------------------------------------
    // Lambda Function 52 ----------------------------------------------
    // -----------------------------------------------------------------
    myLF52.addEnvironment("SQSxx_URL", queue5.queueUrl);
    myLF52.addEnvironment("API_GATEWAY_APIKEY", API_GATEWAY_APIKEY);
    myLF52.addEnvironment("API_GATEWAY_URL", API_GATEWAY_URL);
    myLF52.addEnvironment("PARKINGPAYMENTPROXY_CA", PARKINGPAYMENTPROXY_CA);
    myLF52.addEnvironment("TOKENPROXY_CA", TOKENPROXY_CA);
    myLF52.addEnvironment("NFCADDRESSREGISTRYPROXY_CA", NFCADDRESSREGISTRYPROXY_CA);
    myLF52.addEnvironment("FIREBLOCKS_VID_SERVICEOWNER_ADDR", FIREBLOCKS_VID_SERVICEOWNER_ADDR);
    myLF52.addEnvironment("FIREBLOCKS_VID_SERVICEOWNER", FIREBLOCKS_VID_SERVICEOWNER);
    myLF52.addEnvironment("EXPLOERE", EXPLOERE);
    myLF52.addEnvironment("POLYGON_RPC_URL", POLYGON_RPC_URL);
    myLF52.addEnvironment("FIREBLOCKS_ASSET_ID", FIREBLOCKS_ASSET_ID);
    myLF52.addEnvironment("FIREBLOCKS_ASSET_ID_MYTOKEN", FIREBLOCKS_ASSET_ID_MYTOKEN);
    myLF52.addEnvironment("FIREBLOCKS_API_KEY_SIGNER", FIREBLOCKS_API_KEY_SIGNER);
    myLF52.addEnvironment("FIREBLOCKS_URL", FIREBLOCKS_URL);
    myLF52.addEnvironment("ALCHEMY_HTTPS", ALCHEMY_HTTPS);

    // -----------------------------------------------------------------
    // Lambda Function A1 ----------------------------------------------
    // -----------------------------------------------------------------
    myLFA1.addEnvironment("SQSxx_URL", queueA.queueUrl);
    myLFA1.addEnvironment("API_GATEWAY_APIKEY", API_GATEWAY_APIKEY);
    myLFA1.addEnvironment("API_GATEWAY_URL", API_GATEWAY_URL);
    myLFA1.addEnvironment("PARKINGPAYMENTPROXY_CA", PARKINGPAYMENTPROXY_CA);
    myLFA1.addEnvironment("TOKENPROXY_CA", TOKENPROXY_CA);
    myLFA1.addEnvironment("NFCADDRESSREGISTRYPROXY_CA", NFCADDRESSREGISTRYPROXY_CA);
    myLFA1.addEnvironment("FIREBLOCKS_VID_SERVICEOWNER_ADDR", FIREBLOCKS_VID_SERVICEOWNER_ADDR);
    myLFA1.addEnvironment("FIREBLOCKS_VID_SERVICEOWNER", FIREBLOCKS_VID_SERVICEOWNER);
    myLFA1.addEnvironment("EXPLOERE", EXPLOERE);
    myLFA1.addEnvironment("POLYGON_RPC_URL", POLYGON_RPC_URL);
    myLFA1.addEnvironment("FIREBLOCKS_ASSET_ID", FIREBLOCKS_ASSET_ID);
    myLFA1.addEnvironment("FIREBLOCKS_ASSET_ID_MYTOKEN", FIREBLOCKS_ASSET_ID_MYTOKEN);
    myLFA1.addEnvironment("FIREBLOCKS_API_KEY_SIGNER", FIREBLOCKS_API_KEY_SIGNER);
    myLFA1.addEnvironment("FIREBLOCKS_URL", FIREBLOCKS_URL);
    myLFA1.addEnvironment("ALCHEMY_HTTPS", ALCHEMY_HTTPS);

    // -----------------------------------------------------------------
    // Lambda Function A2 ----------------------------------------------
    // -----------------------------------------------------------------
    myLFA2.addEnvironment("SQSxx_URL", queueA.queueUrl);
    myLFA2.addEnvironment("API_GATEWAY_APIKEY", API_GATEWAY_APIKEY);
    myLFA2.addEnvironment("API_GATEWAY_URL", API_GATEWAY_URL);
    myLFA2.addEnvironment("PARKINGPAYMENTPROXY_CA", PARKINGPAYMENTPROXY_CA);
    myLFA2.addEnvironment("TOKENPROXY_CA", TOKENPROXY_CA);
    myLFA2.addEnvironment("NFCADDRESSREGISTRYPROXY_CA", NFCADDRESSREGISTRYPROXY_CA);
    myLFA2.addEnvironment("FIREBLOCKS_VID_SERVICEOWNER_ADDR", FIREBLOCKS_VID_SERVICEOWNER_ADDR);
    myLFA2.addEnvironment("FIREBLOCKS_VID_SERVICEOWNER", FIREBLOCKS_VID_SERVICEOWNER);
    myLFA2.addEnvironment("EXPLOERE", EXPLOERE);
    myLFA2.addEnvironment("POLYGON_RPC_URL", POLYGON_RPC_URL);
    myLFA2.addEnvironment("FIREBLOCKS_ASSET_ID", FIREBLOCKS_ASSET_ID);
    myLFA2.addEnvironment("FIREBLOCKS_ASSET_ID_MYTOKEN", FIREBLOCKS_ASSET_ID_MYTOKEN);
    myLFA2.addEnvironment("FIREBLOCKS_API_KEY_SIGNER", FIREBLOCKS_API_KEY_SIGNER);
    myLFA2.addEnvironment("FIREBLOCKS_URL", FIREBLOCKS_URL);
    myLFA2.addEnvironment("ALCHEMY_HTTPS", ALCHEMY_HTTPS);

    // -----------------------------------------------------------------
    // Lambda Function Z  ----------------------------------------------
    // -----------------------------------------------------------------
    myLFZ.addEnvironment("API_GATEWAY_APIKEY", API_GATEWAY_APIKEY);
    myLFZ.addEnvironment("API_GATEWAY_URL", API_GATEWAY_URL);
    myLFZ.addEnvironment("PARKINGPAYMENTPROXY_CA", PARKINGPAYMENTPROXY_CA);
    myLFZ.addEnvironment("TOKENPROXY_CA", TOKENPROXY_CA);
    myLFZ.addEnvironment("NFCADDRESSREGISTRYPROXY_CA", NFCADDRESSREGISTRYPROXY_CA);
    myLFZ.addEnvironment("FIREBLOCKS_VID_SERVICEOWNER_ADDR", FIREBLOCKS_VID_SERVICEOWNER_ADDR);
    myLFZ.addEnvironment("FIREBLOCKS_VID_SERVICEOWNER", FIREBLOCKS_VID_SERVICEOWNER);
    myLFZ.addEnvironment("EXPLOERE", EXPLOERE);
    myLFZ.addEnvironment("POLYGON_RPC_URL", POLYGON_RPC_URL);
    myLFZ.addEnvironment("FIREBLOCKS_ASSET_ID", FIREBLOCKS_ASSET_ID);
    myLFZ.addEnvironment("FIREBLOCKS_ASSET_ID_MYTOKEN", FIREBLOCKS_ASSET_ID_MYTOKEN);
    myLFZ.addEnvironment("FIREBLOCKS_API_KEY_SIGNER", FIREBLOCKS_API_KEY_SIGNER);
    myLFZ.addEnvironment("FIREBLOCKS_URL", FIREBLOCKS_URL);
    myLFZ.addEnvironment("ALCHEMY_HTTPS", ALCHEMY_HTTPS);

    //--------------------------------------------------------------------------------
    // END
    // --------------------------------------------------------------------------------
  }
}

// for development, use account/region from cdk cli
const devEnv = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION,
};

const app = new cdk.App();

const STACK_NAME = process.env.STACK_NAME || "PPBS-stack-dev";

new MyStack(app, STACK_NAME, { env: devEnv });

app.synth();
