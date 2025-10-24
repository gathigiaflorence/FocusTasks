# Use a lightweight web server
FROM nginx:alpine

# Copy project files into Nginx's HTML folder
COPY . /usr/share/nginx/html

# Expose the default Nginx port
EXPOSE 80

# Start Nginx server
CMD ["nginx", "-g", "daemon off;"]
