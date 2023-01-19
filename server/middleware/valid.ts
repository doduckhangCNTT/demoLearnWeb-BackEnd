import { NextFunction, Request, Response } from "express";

export const validRegister = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const { name, account, password } = req.body;

  const errors = [];
  if (!name) {
    errors.push("Name must be provided");
  } else if (name.length > 20) {
    errors.push("Name must smaller than 20 characters");
  }

  if (!account) {
    errors.push("Please add your email or phone number");
  } else if (!validPhone(account) && !validEmail(account)) {
    errors.push("Email or phone number is not valid");
  }

  if (password.length < 6) {
    errors.push("Password must smaller than 6 characters");
  }

  if (errors.length > 0) {
    return res.json({ msg: errors });
  }

  next();
};

export const validEmail = (email: string) => {
  return String(email)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
    );
};

export const validPhone = (phone: string) => {
  return phone.match(
    /^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/im
  );
};
