export const imports = {
    // Matches the module name "env" for the @external function
    env: {
        logf(value: number) {
            const val = 10;
            console.log("running external function from typescript, logf:", value, "adding", val, "and returning it");
            return value + val;
        }
    }
};
