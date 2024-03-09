#!/bin/bash

npx hardhat compile

npx hardhat run scripts/deploy.js --network sepolia

#npx hardhat verify --network sepolia
