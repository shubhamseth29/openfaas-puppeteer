# openfaas-puppeteer
This repository contains code to use openfaas as serverless functions to run puppeteer and generate PDF reports, It used K3S for running kubernetes


Follow this tutorial but use command k3s kubectl instead of kubectl everywhere and in the command kubectl expose deployments .... change deployment with pod

https://medium.com/twodigits/setup-openfaas-on-k3s-with-local-docker-registry-7a84ebb54a6f

Pull openfaas template
faas-cli template pull https://github.com/alexellis/openfaas-puppeteer-template
And make new pdf-generaot function
faas-cli new --lang puppeteer-node12 pdf-generator

Replace its files with this folder pdf genertaor files in repo.
And in templates folder under faas-netes folder in your system , inside puppeter-node12 . replace docker file with this one in this repo.

