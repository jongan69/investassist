import * as React from 'react';
import {
  Body,
  Container,
  Head,
  Heading,
  Html,
  Preview,
  Text,
  Button,
  Section,
  Hr,
  Img,
} from "@react-email/components";

interface WelcomeEmailProps {
  name?: string;
}

export const WelcomeEmail: React.FC<Readonly<WelcomeEmailProps>> = ({
  name = "there",
}) => (
  <Html>
    <Head />
    <Preview>Welcome to Invest Assist - Your Financial Intelligence Platform</Preview>
    <Body style={main}>
      <Container style={container}>
        <Heading style={h1}>Welcome to Invest Assist!</Heading>
        <Img src="/android-chrome-192x192.png" alt="Invest Assist Logo" width={100} height={100} />
        <Text style={text}>
          Hi {name},
        </Text>
        <Text style={text}>
          Thank you for signing up for Invest Assist. We&apos;re excited to have you on board!
        </Text>
        <Text style={text}>
          With Invest Assist, you&apos;ll receive:
        </Text>
        <ul style={list}>
          <li style={listItem}>Real-time market insights and trends</li>
          <li style={listItem}>Personalized investment recommendations</li>
          <li style={listItem}>Updates on market movements and opportunities</li>
          <li style={listItem}>Exclusive content and analysis</li>
        </ul>
        <Section style={buttonContainer}>
          <Button style={button} href="https://investassist.com">
            Explore Invest Assist
          </Button>
        </Section>
        <Hr style={hr} />
        <Text style={footer}>
          If you have any questions, feel free to reply to this email.
        </Text>
        <Text style={footer}>
          Best regards,<br />
          The Invest Assist Team
        </Text>
      </Container>
    </Body>
  </Html>
);

export default WelcomeEmail;

const main = {
  backgroundColor: "#f6f9fc",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Ubuntu, sans-serif',
};

const container = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  padding: "20px 0 48px",
  marginBottom: "64px",
  borderRadius: "5px",
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.05)",
};

const h1 = {
  color: "#1a1a1a",
  fontSize: "24px",
  fontWeight: "600",
  lineHeight: "40px",
  margin: "0 0 20px",
  textAlign: "center" as const,
};

const text = {
  color: "#4a4a4a",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 20px",
  padding: "0 20px",
};

const list = {
  color: "#4a4a4a",
  fontSize: "16px",
  lineHeight: "24px",
  margin: "0 0 20px",
  padding: "0 20px 0 40px",
};

const listItem = {
  margin: "0 0 10px",
};

const buttonContainer = {
  textAlign: "center" as const,
  margin: "30px 0",
};

const button = {
  backgroundColor: "#0070f3",
  borderRadius: "5px",
  color: "#fff",
  fontSize: "16px",
  fontWeight: "600",
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "12px 24px",
};

const hr = {
  borderColor: "#e6ebf1",
  margin: "20px 0",
};

const footer = {
  color: "#8898aa",
  fontSize: "14px",
  lineHeight: "22px",
  margin: "0 0 10px",
  padding: "0 20px",
}; 