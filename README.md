# Rooster

Rooster is an application that allows users to deploy React applications effortlessly with a single click. It is designed for quick production testing and in-house testing, providing a seamless experience for developers who want to see their projects live without the hassle of manual deployments.


https://github.com/user-attachments/assets/51a20abd-561c-4179-9df2-44b7c5fa18ba




## What It Solves

Rooster solves the problem of manual and time-consuming deployments for React applications. By automating the deployment process, it allows developers to focus more on building their applications and less on the infrastructure setup. It provides a quick and easy way to deploy applications, making it ideal for rapid testing and continuous integration workflows.

## How to Set It Up Locally

### Prerequisites

- Docker
- Node.js
- Kubernetes (Minikube or any other Kubernetes cluster)

### Steps

1. **Clone the Repository**

   ```bash
   git clone https://github.com/<username>/Rooster.git
   cd rooster
   ```

2. **Build the Docker Image**

   ```bash
   sudo docker build -t your-dockerhub-username/your-image:tag .
   ```

3. **Get your Redis Credentials**

   You can get your Redis credentials from the [RedisLabs](https://redislabs.com/) website.

   change the `.env` file in `api-server` folder with your Redis credentials.

4. ## **api-server env example**

   ```bash
      AWS_ACCESS_KEY_ID=
      AWS_SECRET_ACCESS_KEY=
      CLUSTER=
      TASK=
      REDIS_URI=
      REDIS_PASSWORD=
   ```

5. ## **build-server env example**

   ```bash
      AWS_ACCESS_KEY_ID=
      AWS_SECRET_ACCESS_KEY=
      GIT_REPOSITORY_URL=
   ```

## With K8s

1. **Create Kubernetes Secrets**

   Create a file named `credentials` with the following content:

   ```ini
   [default]
   aws_access_key_id=YOUR_AWS_ACCESS_KEY_ID
   aws_secret_access_key=YOUR_AWS_SECRET_ACCESS_KEY
   ```

2. Then create a Kubernetes Secret:

   ```bash
   kubectl create secret generic aws-credentials --from-file=credentials
   ```

3. **Deploy to Kubernetes**

   Apply the Kubernetes manifests:

   ```bash
   kubectl apply -f deployment.yaml
   kubectl apply -f service.yaml
   ```

4. **Run the Application Locally**

   ```bash
   npm install
   npm run dev
   ```

   The application will be available at `http://localhost:3000`.

## How to Use It

1. Open the application in your browser.
2. Enter the GitHub URL of your React project.
3. Click on the "Deploy" button.
4. Monitor the logs for deployment progress.
5. Once the deployment is complete, the preview URL will be displayed on the screen.

## Tech Stack

- Next.js
- Kubernetes
- Docker
- AWS (ECS, ECR, S3)
- Node.js
- Redis

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

