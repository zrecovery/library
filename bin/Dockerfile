FROM golang:latest
ENV GOPROXY=https://goproxy.io,direct
RUN apt update
RUN apt upgrade
WORKDIR $GOPATH/src
EXPOSE 1323