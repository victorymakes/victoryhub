import { FC } from "react";
import { UuidGenerator } from "./uuid-generator";
import { TimestampConverter } from "./timestamp-converter";
import WhatsMyIP from "./whats-my-ip";
import PasswordGenerator from "./password-generator";
import URLEncoderDecoder from "./url-encoder-decoder";
import Base64EncoderDecoder from "./base64-encoder-decoder";
import ImageCompressor from "./image-compressor";
import ImageConverter from "./image-converter";
import QRCodeGenerator from "./qrcode-generator";
import CronExpressionGenerator from "./cron-expression-generator";
import BMICalculator from "./bmi-calculator";
import BMRCalculator from "./bmr-calculator";
import CarbonFootprintCalculator from "./carbon-footprint-calculator";
import RandomPicker from "./random-picker";
import TextFaviconGenerator from "./text-favicon-generator";
import { ColorModelConverter } from "./color-model-converter";
import SLOBurnSimulator from "./slo-burn-simulator";

interface ToolComponentProps {
    id: string;
    underConstructionMessage: string;
}

export const ToolComponent: FC<ToolComponentProps> = ({
    id,
    underConstructionMessage,
}) => {
    switch (id) {
        case "uuid-generator":
            return <UuidGenerator />;
        case "timestamp-converter":
            return <TimestampConverter />;
        case "whats-my-ip":
            return <WhatsMyIP />;
        case "password-generator":
            return <PasswordGenerator />;
        case "url-encoder-decoder":
            return <URLEncoderDecoder />;
        case "random-picker":
            return <RandomPicker />;
        case "base64-encoder-decoder":
            return <Base64EncoderDecoder />;
        case "image-compressor":
            return <ImageCompressor />;
        case "image-converter":
            return <ImageConverter />;
        case "qrcode-generator":
            return <QRCodeGenerator />;
        case "cron-expression-generator":
            return <CronExpressionGenerator />;
        case "bmi-calculator":
            return <BMICalculator />;
        case "bmr-calculator":
            return <BMRCalculator />;
        case "carbon-footprint-calculator":
            return <CarbonFootprintCalculator />;
        case "text-favicon-generator":
            return <TextFaviconGenerator />;
        case "color-model-converter":
            return <ColorModelConverter />;
        case "slo-burn-simulator":
            return <SLOBurnSimulator />;
        default:
            return (
                <p className="text-muted-foreground text-sm">
                    ${underConstructionMessage}
                </p>
            );
    }
};
