FROM tomcat:11-jdk21-temurin

# Remove Tomcat default applications
RUN rm -rf /usr/local/tomcat/webapps/*

# Copy QueueLess WAR into Tomcat
COPY QueueLess.war /usr/local/tomcat/webapps/ROOT.war

# Change Tomcat port from 8080 to Render's default port
RUN sed -i 's/port="8080"/port="10000"/g' /usr/local/tomcat/conf/server.xml

EXPOSE 10000

# Start Tomcat
CMD ["catalina.sh", "run"]
