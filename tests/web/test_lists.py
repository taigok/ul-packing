def test_get_lists_index(client) -> None:
    response = client.get("/")
    assert response.status_code == 200
    assert "パッキングリスト" in response.text


def test_create_list_success(client) -> None:
    response = client.post(
        "/lists",
        data={"title": "北アルプス", "description": "夏山2泊"},
        follow_redirects=False,
    )
    assert response.status_code == 303


def test_create_list_validation_error(client) -> None:
    response = client.post("/lists", data={"title": "", "description": ""})
    assert response.status_code == 400
    assert "タイトルは必須" in response.text
