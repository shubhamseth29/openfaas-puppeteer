FROM openfaas/of-watchdog:0.7.2 as watchdog
FROM buildkite/puppeteer:5.2.1

ENV APT_KEY_DONT_WARN_ON_DANGEROUS_USAGE=1
ARG ADDITIONAL_PACKAGE

RUN if test -n "${ADDITIONAL_PACKAGE}"; then apt-get update \
    && apt-get install -y curl gnupg \
    && curl -sLSf https://dl-ssl.google.com/linux/linux_signing_key.pub -o - | apt-key add - \
    && apt-get update ;fi

RUN if test -n "${ADDITIONAL_PACKAGE}"; then apt-get install -y ${ADDITIONAL_PACKAGE} --no-install-recommends \
    && rm -rf /var/lib/apt/lists/* ;fi

COPY --from=watchdog /fwatchdog /usr/bin/fwatchdog
RUN chmod +x /usr/bin/fwatchdog

RUN addgroup --system app \
    && adduser --system --ingroup app app

# Install OpenJDK- 
# (https://stackoverflow.com/a/61713897)
# https://github.com/geerlingguy/ansible-role-java/issues/64#issuecomment-597132394
RUN mkdir /usr/share/man/man1/
RUN apt-get update && \
    apt-get -y install default-jre-headless && \
    apt-get -y install openjdk-11-jre-headless && \
    apt-get install -y openjdk-11-jdk && \
    apt-get install -y ant && \
    apt-get clean;

RUN npm i puppeteer@5.3.0

# Setup JAVA_HOME -- useful for docker commandline
ENV JAVA_HOME /usr/lib/jvm/java-11-openjdk-amd64/
RUN export JAVA_HOME

WORKDIR /root/

# Turn down the verbosity to default level.
ENV NPM_CONFIG_LOGLEVEL warn

RUN mkdir -p /home/app

# Wrapper/boot-strapper
WORKDIR /home/app
COPY package.json ./

# This ordering means the npm installation is cached for the outer function handler.
RUN npm i

# Copy outer function handler
COPY index.js ./

# COPY function node packages and install, adding this as a separate
# entry allows caching of npm install

WORKDIR /home/app/function

COPY function/*.json ./

RUN npm i || :

# COPY function files and folders
COPY function/ ./

# Run any tests that may be available
RUN npm test

# Set correct permissions to use non root user
WORKDIR /home/app/

# chmod for tmp is for a buildkit issue (@alexellis)
RUN chown app:app -R /home/app \
    && chmod 777 /tmp

USER app

ENV cgi_headers="true"
ENV fprocess="node index.js"
ENV mode="http"
ENV upstream_url="http://127.0.0.1:3000"

ENV exec_timeout="10s"
ENV write_timeout="15s"
ENV read_timeout="15s"
ENV PATH="${PATH}:/node_modules/.bin"

HEALTHCHECK --interval=3s CMD [ -e /tmp/.lock ] || exit 1

CMD ["fwatchdog"]

