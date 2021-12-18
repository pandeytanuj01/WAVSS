FROM node:16

RUN apt-get -y update && apt-get -y install nmap && apt-get install -y xsltproc
RUN cd /usr/share/nmap/scripts && git clone https://github.com/scipag/vulscan scipag_vulscan && git clone https://github.com/vulnersCom/nmap-vulners.git
# Create app directory
WORKDIR /usr/src/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package*.json ./

# RUN npm install
# If you are building your code for production
RUN npm ci --only=production

# Bundle app source
COPY . .

EXPOSE 4000

CMD [ "npm", "start"]