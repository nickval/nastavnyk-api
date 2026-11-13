import { RegistrationError, FieldErrors } from "./errors";
import { userRepository, User } from "../users/userRepository";
import { lengthBetween, matches, validate } from "../validation/rules";
import { EMAIL_PATTERN, USERNAME_PATTERN } from "../validation/patterns";

export interface RegisterInput {
  email: string;
  username: string;
  password: string;
}

export function registerUser(input: RegisterInput): User {
  const email = input.email.trim().toLowerCase();

  const fields: FieldErrors = {};
  const emailErrors = validate(email, [matches(EMAIL_PATTERN, "must be a valid email")]);
  const usernameErrors = validate(input.username, [
    lengthBetween(3, 20),
    matches(USERNAME_PATTERN, "may contain only Latin letters, digits and _"),
  ]);
  const passwordErrors = validate(input.password, [lengthBetween(8, 72)]);
  if (emailErrors.length) fields.email = emailErrors;
  if (usernameErrors.length) fields.username = usernameErrors;
  if (passwordErrors.length) fields.password = passwordErrors;
  if (Object.keys(fields).length) throw new RegistrationError("INVALID_INPUT", fields);

  if (userRepository.findByEmail(email)) throw new RegistrationError("EMAIL_TAKEN");
  if (userRepository.findByUsername(input.username)) throw new RegistrationError("USERNAME_TAKEN");

  return userRepository.create({ email, username: input.username });
}
