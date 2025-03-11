if (process.env.npm_execpath?.includes("yarn")) {
  console.error("Please use npm instead of yarn")
  process.exit(1)
}
