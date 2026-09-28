# QueueLess Backend

QueueLess - Smart Student Campus Service Platform

This folder contains the Java backend for the QueueLess application.

## Technology

- Java 21
- Apache Tomcat 11
- Jakarta Servlet
- MySQL
- Docker
- Render

## Application

The Java web application is packaged as:

QueueLess.war

The application uses Apache Tomcat 11.

## Servlet Endpoints

The backend provides the following main endpoints:

- AuthServlet
- QueueServlet
- QueueTrackServlet
- AdminQueueServlet

## Docker

The backend is deployed using Docker.

The Dockerfile uses:

Tomcat 11 + JDK 21

The QueueLess WAR file is deployed as:

ROOT.war

This allows the servlet URLs to be accessed directly.

## Database

QueueLess uses MySQL.

Database name:

queueless_db

The database structure is available in:

database/queueless_db.sql

## Environment Variables

The deployed backend requires:

DB_HOST
DB_PORT
DB_NAME
DB_USER
DB_PASSWORD
DB_SSL_MODE

Example:

DB_HOST=your-database-host
DB_PORT=3306
DB_NAME=queueless_db
DB_USER=your-database-user
DB_PASSWORD=your-database-password
DB_SSL_MODE=REQUIRED

## Local Development

The project can be developed and tested using:

- NetBeans
- Java 21
- Apache Tomcat 11
- MySQL

## Deployment

The backend is deployed to Render using the Dockerfile.

The frontend is deployed separately to Netlify.

Netlify communicates with the Java backend through the proxy rules in netlify.toml.
