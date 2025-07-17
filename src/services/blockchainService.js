const { ethers } = require("ethers");
const winston = require("winston");

const logger = winston.createLogger({
    level: "info",
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: "logs/combined.log" }),
        new winston.transports.Console(),
    ],
});

class BlockchainService {
    constructor() {
        try {
            logger.info("Initializing BlockchainService");

            const {
                RPC_URL,
                PRIVATE_KEY,
                CONTRACT_ADDRESS,
                CHAIN_ID,
                CHAIN_NAME,
            } = process.env;

            if (!RPC_URL || !PRIVATE_KEY || !CONTRACT_ADDRESS) {
                throw new Error(
                    "Missing RPC_URL, PRIVATE_KEY, or CONTRACT_ADDRESS"
                );
            }

            if (!PRIVATE_KEY.startsWith("0x") || PRIVATE_KEY.length !== 66) {
                throw new Error(
                    "PRIVATE_KEY must be 64 hex characters starting with 0x"
                );
            }

            this.provider = new ethers.JsonRpcProvider(RPC_URL, {
                chainId: Number(CHAIN_ID),
                name: CHAIN_NAME,
            });

            this.wallet = new ethers.Wallet(PRIVATE_KEY, this.provider);

            const abi = [
                {
                    inputs: [
                        {
                            internalType: "string",
                            name: "sensorId",
                            type: "string",
                        },
                        {
                            internalType: "uint256",
                            name: "pH",
                            type: "uint256",
                        },
                        {
                            internalType: "uint256",
                            name: "temperature",
                            type: "uint256",
                        },
                        {
                            internalType: "uint256",
                            name: "turbidity",
                            type: "uint256",
                        },
                        {
                            internalType: "uint256",
                            name: "salinity",
                            type: "uint256",
                        },
                        {
                            internalType: "uint256",
                            name: "waterLevel",
                            type: "uint256",
                        },
                    ],
                    name: "checkWaterQuality",
                    outputs: [],
                    stateMutability: "nonpayable",
                    type: "function",
                },
                {
                    inputs: [],
                    name: "getReadings",
                    outputs: [
                        {
                            components: [
                                {
                                    internalType: "string",
                                    name: "sensorId",
                                    type: "string",
                                },
                                {
                                    internalType: "uint256",
                                    name: "pH",
                                    type: "uint256",
                                },
                                {
                                    internalType: "uint256",
                                    name: "temperature",
                                    type: "uint256",
                                },
                                {
                                    internalType: "uint256",
                                    name: "turbidity",
                                    type: "uint256",
                                },
                                {
                                    internalType: "uint256",
                                    name: "salinity",
                                    type: "uint256",
                                },
                                {
                                    internalType: "uint256",
                                    name: "waterLevel",
                                    type: "uint256",
                                },
                                {
                                    internalType: "uint256",
                                    name: "timestamp",
                                    type: "uint256",
                                },
                            ],
                            internalType: "struct WaterQuality.Reading[]",
                            name: "",
                            type: "tuple[]",
                        },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
                {
                    inputs: [],
                    name: "getReadingCount",
                    outputs: [
                        { internalType: "uint256", name: "", type: "uint256" },
                    ],
                    stateMutability: "view",
                    type: "function",
                },
            ];

            this.contract = new ethers.Contract(
                CONTRACT_ADDRESS,
                abi,
                this.wallet
            );

            logger.info("BlockchainService initialized successfully");
        } catch (error) {
            logger.error("BlockchainService initialization error", {
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    async submitWaterQuality(
        sensorId,
        pH,
        temperature,
        turbidity,
        salinity,
        waterLevel
    ) {
        try {
            // Ensure proper parsing and scaling
            const pHInt = Math.round(parseFloat(pH) * 10);
            const tempInt = Math.round(parseFloat(temperature) * 10);
            const turbInt = Math.round(parseFloat(turbidity) * 1000);
            const salinityInt = Math.round(parseFloat(salinity) * 10);
            const waterLevelInt = Math.round(parseFloat(waterLevel) * 10);

            logger.info("Submitting to blockchain", {
                sensorId,
                pH: pHInt,
                temperature: tempInt,
                turbidity: turbInt,
                salinity: salinityInt,
                waterLevel: waterLevelInt,
            });

            const tx = await this.contract.checkWaterQuality(
                sensorId,
                pHInt,
                tempInt,
                turbInt,
                salinityInt,
                waterLevelInt,
                { gasLimit: 300000 }
            );

            const receipt = await tx.wait();

            if (receipt.status !== 1) {
                throw new Error("Transaction reverted with no error message");
            }

            logger.info("Transaction successful", { hash: tx.hash });
            return tx.hash;
        } catch (error) {
            logger.error("Transaction failed", {
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }

    async getWaterQualityData() {
        try {
            const readings = await this.contract.getReadings();
            return readings.map((r) => ({
                sensorId: r.sensorId,
                pH: Number(r.pH) / 10,
                temperature: Number(r.temperature) / 10,
                turbidity: Number(r.turbidity) / 1000,
                salinity: Number(r.salinity) / 10,
                waterLevel: Number(r.waterLevel) / 10,
                timestamp: Number(r.timestamp),
            }));
        } catch (error) {
            logger.error("Failed to fetch water quality data", {
                error: error.message,
                stack: error.stack,
            });
            throw error;
        }
    }
}

module.exports = BlockchainService;
