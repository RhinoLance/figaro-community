---
sidebar_position: 1
---

# Tutorial Intro


:::warning

Figaro is a labour of love, no warranty, implied or express is provided.


The only intelligence involved in deciding if a series of CAT commands are safe 
to run on your radio is yours.

Likewise, scripts found in the community library are a convenience tool to share
 user's scripts.  You should ensure that you are comfortable with them before 
 installing or executing.

Be aware also, that the CAT API may change between firmware versions.  Review 
your scripts in conjunction with planned firmware updates.

:::

That out of the way, let's discover **Figaro in less than 5 minutes**.

## Getting Started

Get started by **connecting your radio to Figaro**.

### What you'll need

- An amazing radio; QMX or QMX+.
- A phone/tablet with Figaro installed
**OR**
- A modern browser pointing to [Figaro's Web App](https://app.figaro.conryclan.com/).

### QMX serial port

If you haven't already, configure your QMX to enable at least one serial port
by following the menu to:

Configuration > System config > GPS & Ser. ports > USB serial ports

### Connect your radio

Connect a USB cable between your radio and computer/phone/tablet.  Ensure
that your cable is able to transfer data, and not only power.

#### Computer

The first time you try to connect, you'll be prompted to select the port on 
which the QMX is connected.  If in doubt, 
review the ports in Device Manager, or the Mac/Linux equivilent.

#### Android

When you connect your radio for the first time you will be prompted to allow
access to the microphone.  This is referring to the the QMX's audio interface.
Figaro doesn't use it, but because it's available on the USB port, we can't 
connect to the USB, and it's serial interface, without that permission.  
You won't need to select a port however as Figaro will automatically cycle 
through all ports loking for a QMX.
