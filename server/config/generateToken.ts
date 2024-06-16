import { Response } from "express";
import jwt from "jsonwebtoken";

export const generateActiveToken = (payload: object) => {
  return jwt.sign(payload, `${process.env.ACTIVE_TOKEN_SECRET}`, {
    expiresIn: "5m",
  });
};

export const generateAccessToken = (payload: object) => {
  return jwt.sign(payload, `${process.env.ACCESS_TOKEN_SECRET}`, {
    expiresIn: "1d",
  });
};

export const generateRefreshToken = (payload: object, res: Response) => {
  const refresh_token = jwt.sign(
    payload,
    `${process.env.REFRESH_TOKEN_SECRET}`,
    { expiresIn: "30d" }
  );

  res.cookie("refreshtoken", refresh_token, {
    // Khi deploy thì khi refresh lại trang thì nó sẽ ko giữ được tài khoản người dùng đã đăng nhập lên cần xác định 2 thuộc tính này
    sameSite: "none",
    secure: true,
    // ------------------------------
    httpOnly: true,

    path: "/api/refresh_token",
    maxAge: 30 * 24 * 60 * 60 * 1000,
  });

  return refresh_token;
};
