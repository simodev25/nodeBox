FROM bitnami/node:14

RUN apt-get update &&  apt-get install git

ADD lib/helper.js /index_rt/lib/
ADD lib/winston.js /index_rt/lib/
ADD lib/server.js /index_rt/lib/
ADD index.js /index_rt/
ADD package.json /index_rt/
ADD npm-install.sh /
ADD functions /functions

WORKDIR /index_rt/

RUN npm install -g nodemon

RUN npm install

RUN chown -Rh $user:$user /functions

USER $user



ENV FUNC_HANDLER index
ENV FUNC_MEMORY_LIMIT 0
ENV FUNC_PORT 8085
ENV FUNC_RUNTIME nodejs14
ENV FUNC_TIMEOUT 180
ENV INSTALL_VOLUME /functions
ENV MOD_NAME handler
ENV NODE_PATH functions/node_modules

CMD ["nodemon", "kubeless.js"]
