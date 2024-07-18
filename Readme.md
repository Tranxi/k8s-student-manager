# Student management system built on K8s

---

## Overview

This project is a simplified yet cloud-native student management system built on Kubernetes.

It provides essential functionalities for managing student information, including:

1. user authentication
2. student grade viewing
3. teacher grade modification
4. administrator course management

The system leverages Kubernetes for scalable deployment and management of its microservices architecture,

 ensuring flexibility and resilience in handling educational data.

 ---

## Set up

### 1、Prerequisites

- You need an AWS EKS (Elastic Kubernetes Service) cluster set up.
- Ensure kubectl is configured to communicate with your AWS EKS cluster
- Adds on EBS to your EKS group.

#### Note

If deploying locally or in a non-cloud environment, **manual creation of PersistentVolumes** might be required as AWS EBS dynamically provisions PVs when PersistentVolumeClaims (PVCs) are created in the cluster.

### 2、Deploying the Application

#### 1. Clone the repository

   ``git clone https://github.com/Tranxi/k8s-student-manager.git``
   ``cd k8s-student-manager/yaml``

#### 2. Setup two databases(users & courses)

   ``kubectl apply -f users-DB.yaml && kubectl apply -f course-DB.yaml``

#### 3. Apply the secret for databases

    ``kubectl apply -f secret.yaml``

#### 4. Initialize two databases

 There is two json files in diretory database-json.
   You can use **mongorestore command** to restore the database.

Also, you can manually insert entries into the database without creating a Job or mounting backup files.

``kubectl get pods``

pod named **mongo-xxx** runs the users-database.

pod named **mongo-course-xxx** runs the course-database.

---

##### users-DB

1. enter the pod
``kubectl exec -it mongo-xxx -- sh``
2. create an administrator account in MongoDB
``mongo`` // connect to database directly
// inside the mongoDB (Command line starts with **#**)
``use admin``
// create user
``db.createUser({
  user: "admin",
  pwd: "password",
  roles: [ { role: "root", db: "admin" } ]
})``
// exit
``exit``
3. connect to the database inside the pod with authentication
``mongo -u admin -p password --authenticationDatabase admin``
4. insert entries
``use school;``
``db.createCollection('users');``
``db.users.insertMany([
  {
    "_id": ObjectId("6690fd387719b0e8b7af584c"),
    "role": "admin",
    "username": "admin",
    "password": "password"
  },
  {
    "_id": ObjectId("6690fd657719b0e8b7af584e"),
    "role": "teacher",
    "username": "teacher",
    "password": "123"
  },
  {
    "_id": ObjectId("6690fd767719b0e8b7af5850"),
    "role": "student",
    "username": "student",
    "password": "123"
  }
]);``

---

##### course-DB

similar steps
``kubectl exec -it mongo-course-xxx -- sh``
// create user
``mongo``
``use admin``
``db.createUser({
  user: "admin",
  pwd: "password",
  roles: [ { role: "root", db: "admin" } ]
})``
//exit
``exit``
// connect with authentication
``mongo -u admin -p password --authenticationDatabase admin``

``use courseDB;``

``db.createCollection('users');``

``db.collectionName.insertMany([
  {
    "_id": ObjectId("66938b0d105418f15b2daa8c"),
    "courseName": "Computer Network",
    "students": [
      {
        "username": "Alan",
        "grade": "A"
      },
      {
        "username": "Bob",
        "grade": "B"
      }
    ]
  },
  {
    "_id": ObjectId("6695cdc719eebb37357f0af9"),
    "courseName": "Operating System",
    "students": [
      {
        "username": "Alan",
        "grade": "A+"
      },
      {
        "username": "student",
        "grade": "A-"
      }
    ]
  }
]);``

---

#### 5. Deploy the login-app and success-app

##### Functions of login-app and success-app

- The directories "login-app" and "success-app" are two Node.js projects. These projects have been **containerized** and the Docker Image have been pushed to Docker hub.

- So you need't care about them unless you want to build the Image manually again.

- The login-app provides a login interface where users can enter their username, password, and authenticate against the users-database.

- Once authenticated, users are redirected to the page that success-app provides. Success-app also implement essential functionalities mentioned in overview.

##### Deploy the applications in kubernetes cluster

``kubectl apply -f succcess.yaml``
get the external address of success-service, modify the login.yaml mannually.
``kubectl get service``
modify the **SUCCESS_SERVICE_URL** in login.yaml
``kubectl apply -f login.yaml``

#### 6. Deploy the backup CronJob

##### backup the course-database

``kubectl apply -f course-backup-pvc.yaml``
``kubectl apply -f course-backup-CronJob.yaml``

##### backup the users-database

``kubectl apply -f users-Backup-Statefulset.yaml``

##### View the backup files

``kubectl apply -f pv-inspector.yaml``
Then a temporary pod will be created(the pod lasts for 1 hour).
You can enter the pod and list the content below the directory /mnt/pv

---

## Configuration

- In login.yaml, replace the env variable **SUCCESS_SERVICE_URL** with your success-service external-ip.
- modify the secret.yaml to set the authentication method for your database.

---

## Accessing the Application

use command:

``kubectl get service``

Find the DNS address(external-ip) of the LoadBalancer named "login-app-service"

Navigate to <http://external-ip/login> in your web browser to access the deployed applications.

The address below is currently available to access, before the AWS budget runs out.

[k8s-student-manager](http://a45f00ff1afb54d339a653ca2620d4cc-194346202.us-east-1.elb.amazonaws.com/login)

---

## Contact

For any issues or support, please contact us at:
<qfx1036927311@gmail.com>
