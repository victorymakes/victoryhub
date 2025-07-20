import { FC } from "react";
import { UuidGenerator } from "./uuid-generator";
import { TimestampConverter } from "./timestamp-converter";
import WhatsMyIP from "./whats-my-ip";
import PasswordGenerator from "./password-generator";
import URLEncoderDecoder from "./url-encoder-decoder";
import Base64EncoderDecoder from "./base64-encoder-decoder";

interface ToolComponentProps {
    id: string;
}

export const ToolComponent: FC<ToolComponentProps> = ({ id }) => {
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
        default:
            return (
                <p className="text-muted-foreground text-sm">
                    This tool is under construction.
                </p>
            );
    }
};
