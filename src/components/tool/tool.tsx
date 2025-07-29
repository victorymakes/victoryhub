import { FC } from "react";
import { UuidGenerator } from "./uuid-generator";
import { TimestampConverter } from "./timestamp-converter";
import WhatsMyIP from "./whats-my-ip";
import PasswordGenerator from "./password-generator";
import URLEncoderDecoder from "./url-encoder-decoder";
import Base64EncoderDecoder from "./base64-encoder-decoder";
import ImageCompressor from "./image-compressor";
// import ImageResizer from "./image-resizer";
import ImageConverter from "./image-converter";
// import QRCodeGenerator from "./qrcode-generator";

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
        case "base64-encoder-decoder":
            return <Base64EncoderDecoder />;
        case "image-compressor":
            return <ImageCompressor />;
        // case "image-resizer":
        //     return <ImageResizer />;
        case "image-converter":
            return <ImageConverter />;
        // case "qrcode-generator":
        //     return <QRCodeGenerator />;
        default:
            return (
                <p className="text-muted-foreground text-sm">
                    ${underConstructionMessage}
                </p>
            );
    }
};
