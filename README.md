# Secretary Bird

> A GitHub App built with [Probot](https://github.com/probot/probot) that
> makes sure you've filled out all your paperwork correctly!

## Usage

1.  [Install the application](https://github.com/app/secretary-bird) for your repositories or organizations.
2.  Configure the application with a `.github/secretary-bird.yml` in your repository.

## Configuration

```yaml
pull_request_title:
  pattern: .*
  failure_message: >-
    Markdown formatted string that will be included with failed check runs.
  success_message: >-
    Markdown formatted string that will be included with successful check runs.
commit_title:
  pattern: .*
  failure_message: >-
    Markdown formatted string that will be included with failed check runs.
  success_message: >-
    Markdown formatted string that will be included with successful check runs.
```

### `pattern`

Specify a regex pattern to match strings. By default this is `.*`.

### `failure_message`

Optional. This is a Markdown formatted string that will be included in the body
of the check run on failure. Use this to include more information about your
team's best practices.

### `success_message`

Optional. This is a Markdown formatted string that will be included in the body
of the check run on success. Use this to provide some encouragement for a job
well done.

## Contributing

If you have suggestions for how Secretary Bird could be improved, or want to
report a bug, open an issue! We'd love all and any contributions.

For more, check out the [Contributing Guide](CONTRIBUTING.md).

## License

MIT.
