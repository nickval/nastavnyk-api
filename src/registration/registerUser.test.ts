import { registerUser } from "./registerUser";
import { userRepository } from "../users/userRepository";
import { RegistrationError } from "./errors";

const validInput = {
  email: "new.user@example.com",
  username: "new_user",
  password: "s3cret-pass",
};

beforeEach(() => {
  userRepository.reset();
});

describe("registerUser", () => {
  it("registers a user with valid data", () => {
    const user = registerUser(validInput);

    expect(user).toMatchObject({ email: "new.user@example.com" });
    expect(userRepository.findByEmail("new.user@example.com")).toBeDefined();
  });

  it("rejects an invalid email", () => {
    expect(() => registerUser({ ...validInput, email: "not-an-email" })).toThrow(
      "Please check the highlighted fields",
    );
  });

  it("rejects a password shorter than 8 characters", () => {
    expect(() => registerUser({ ...validInput, password: "short" })).toThrow(
      "Please check the highlighted fields",
    );
  });

  it("rejects an email that is already registered", () => {
    expect(() => registerUser({ ...validInput, email: "John@Example.com" })).toThrow(
      "Email already registered",
    );
  });

  describe("username", () => {
    function registrationError(username: string): RegistrationError {
      try {
        registerUser({ ...validInput, username });
      } catch (e) {
        if (e instanceof RegistrationError) return e;
        throw e;
      }
      throw new Error(`expected registration with username "${username}" to fail`);
    }

    it.each(["abc", "a".repeat(20)])("accepts boundary length: %s", (username) => {
      expect(registerUser({ ...validInput, username })).toMatchObject({ username });
    });

    it.each(["ab", "a".repeat(21), ""])("rejects invalid length: %p", (username) => {
      const error = registrationError(username);
      expect(error.code).toBe("INVALID_INPUT");
      expect(error.message).toBe("Please check the highlighted fields");
      expect(error.fields.username).toBeDefined();
    });

    it.each(["new-user", "нов_user", "new user", " new_user", "new.user"])(
      "rejects disallowed characters: %p",
      (username) => {
        const error = registrationError(username);
        expect(error.code).toBe("INVALID_INPUT");
        expect(error.fields.username).toBeDefined();
      },
    );

    it("rejects a username that is already taken", () => {
      const error = registrationError("olena_m");
      expect(error.code).toBe("USERNAME_TAKEN");
      expect(error.message).toBe("Username already taken");
    });

    it.each(["john_doe", "JOHN_DOE", "jOhN_dOe"])(
      "checks uniqueness case-insensitively: %s",
      (username) => {
        expect(() => registerUser({ ...validInput, username })).toThrow(
          "Username already taken",
        );
      },
    );

    it("stores the username exactly as entered", () => {
      registerUser({ ...validInput, username: "Anna_K" });

      expect(userRepository.findByEmail(validInput.email)?.username).toBe("Anna_K");
    });
  });
});
